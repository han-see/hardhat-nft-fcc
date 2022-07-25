import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import * as fs from "fs"
import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { DynamicSvgNft, MockV3Aggregator } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DynamicNft Test", function () {
          let dynamicNft: DynamicSvgNft
          let deployer: SignerWithAddress
          let minter1: SignerWithAddress
          let minter2: SignerWithAddress
          let aggrMock: MockV3Aggregator

          this.beforeEach(async () => {
              const accounts = await ethers.getSigners()
              await deployments.fixture(["dynamicNft"])
              deployer = accounts[0]
              minter1 = accounts[1]
              minter2 = accounts[2]
              dynamicNft = await ethers.getContract("DynamicSvgNft", deployer)
              aggrMock = await ethers.getContract("MockV3Aggregator")
          })

          describe("constructor", () => {
              it("initializes the contract correctly", async () => {
                  const contractName = await dynamicNft.name()
                  const contractSymbol = await dynamicNft.symbol()
                  assert.equal(contractName, "Dynamic SVG NFT")
                  assert.equal(contractSymbol, "DSN")
              })
          })

          describe("svgToImageURI", () => {
              it("converts image to URI", async () => {
                  const img = fs.readFileSync("./images/dynamicNft/frown.svg", {
                      encoding: "utf-8",
                  })
                  const buff = Buffer.from(img)
                  const base64Data = buff.toString("base64")
                  const base64Prefix = "data:image/svg+xml;base64,"

                  assert.equal(await dynamicNft.svgToImageURI(img), base64Prefix + base64Data)
              })
          })
      })
