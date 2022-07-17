import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { RandomIpfsNft } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomNft Test", function () {
          let randomNft: RandomIpfsNft
          let deployer: SignerWithAddress
          let minter1: SignerWithAddress
          let minter2: SignerWithAddress

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              await deployments.fixture(["randomNft"])
              deployer = accounts[0]
              minter1 = accounts[1]
              minter2 = accounts[2]
              randomNft = await ethers.getContract("RandomIpfsNft", deployer)
          })

          describe("constructor", () => {
              it("initializes the contract name correctly", async () => {
                  const nftName = await randomNft.name()
                  const nftSymbol = await randomNft.symbol()
                  assert.equal(nftName, "Random IPFS NFT")
                  assert.equal(nftSymbol, "RIN")
              })
              
          })
      })
