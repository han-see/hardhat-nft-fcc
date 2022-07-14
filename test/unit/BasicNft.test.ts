import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BasicNft } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic Nft Unit Test", function () {
          let basicNft: BasicNft
          let deployer: SignerWithAddress
          let minter1: SignerWithAddress
          let minter2: SignerWithAddress

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              await deployments.fixture(["basicNft"])
              deployer = accounts[0]
              minter1 = accounts[1]
              minter2 = accounts[2]
              basicNft = await ethers.getContract("BasicNft", deployer)
          })

          describe("constructor", () => {
              it("initializes the nft correctly", async () => {
                  const nftName = await basicNft.name()
                  const nftSymbol = await basicNft.symbol()
                  assert.equal(nftName, "Dogie")
                  assert.equal(nftSymbol, "DOG")
              })
          })

          describe("Mint function", () => {
              it("mint correctly", async () => {
                  await basicNft.connect(minter1)
                  await expect(basicNft.mintNft()).to.not.be.reverted
                  assert(await basicNft.getTokenCounter.toString, "1")
              })
          })
      })
