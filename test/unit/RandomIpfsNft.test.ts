import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { parseEther } from "ethers/lib/utils"
import { deployments, ethers, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomNft Test", function () {
          let randomNft: RandomIpfsNft
          let deployer: SignerWithAddress
          let minter1: SignerWithAddress
          let minter2: SignerWithAddress
          let vrfMock: VRFCoordinatorV2Mock

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              await deployments.fixture(["randomNft"])
              deployer = accounts[0]
              minter1 = accounts[1]
              minter2 = accounts[2]
              randomNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfMock = await ethers.getContract("VRFCoordinatorV2Mock")
          })

          describe("constructor", () => {
              it("initializes the contract name correctly", async () => {
                  const nftName = await randomNft.name()
                  const nftSymbol = await randomNft.symbol()
                  assert.equal(nftName, "Random IPFS NFT")
                  assert.equal(nftSymbol, "RIN")
              })
          })

          describe("requestNft", () => {
              it("successfully requested random number", async () => {
                  await expect(
                      randomNft.requestNft({
                          value: networkConfig[network.name].mintFee,
                      })
                  ).to.emit(randomNft, "NftRequested")
              })
              it("reverts when not enough ETH sent", async () => {
                  await expect(
                      randomNft.requestNft({
                          value: parseEther("0.0001"),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NotEnoughEthSent")
              })
          })

          describe("fulfillRandomWords", () => {
              it("successfully mintNft", async () => {
                  randomNft = randomNft.connect(minter1)
                  const tx = await randomNft.requestNft({
                      value: networkConfig[network.name].mintFee,
                  })
                  const txReceipt = await tx.wait(1)
                  const requestId = txReceipt.events![1].args!.requestId
                  await expect(vrfMock.fulfillRandomWords(requestId, randomNft.address)).to.emit(
                      randomNft,
                      "NftMinted"
                  )
                  const tokenCounter = await (await randomNft.getTokenCounter()).toString()
                  assert.equal(tokenCounter, "1")
              })
          })

          describe("getBreed", () => {
              it("gives back PUG", async () => {
                  const breed = await randomNft.getBreedFromModdedRng(5)
                  assert.equal("0", breed.toString())
              })
              it("gives back SHIBA", async () => {
                  const breed = await randomNft.getBreedFromModdedRng(37)
                  assert.equal("1", breed.toString())
              })
              it("gives back ST_BERNARD", async () => {
                  const breed = await randomNft.getBreedFromModdedRng(99)
                  assert.equal("2", breed.toString())
              })
              it("reverts when index is wrong", async () => {
                  await expect(randomNft.getBreedFromModdedRng(170)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })

          describe("withdraw", () => {
              it("reverts the withdraw on non owner", async () => {
                  randomNft = randomNft.connect(minter1)
                  await expect(randomNft.withdraw()).to.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
              it("withdraw the correct amount", async () => {
                  const mintFee = networkConfig[network.name].mintFee
                  const deployerBalanceBeforeWithdraw = await deployer.getBalance()
                  randomNft = randomNft.connect(minter1)
                  await randomNft.requestNft({
                      value: mintFee,
                  })
                  randomNft = randomNft.connect(minter2)
                  await randomNft.requestNft({
                      value: mintFee,
                  })
                  randomNft = randomNft.connect(deployer)
                  const withdrawTxResponse = await (await randomNft.withdraw()).wait()
                  const deployerBalanceAfterWithdraw = await deployer.getBalance()
                  const expectedDeployerBalance = deployerBalanceAfterWithdraw
                      .sub(deployerBalanceBeforeWithdraw)
                      .add(
                          withdrawTxResponse.cumulativeGasUsed.mul(
                              withdrawTxResponse.effectiveGasPrice
                          )
                      )
                  assert.equal(expectedDeployerBalance.toString(), mintFee.mul(2).toString())
              })
          })
      })
