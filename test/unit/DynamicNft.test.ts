import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { parseEther } from "ethers/lib/utils"
import * as fs from "fs"
import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { DynamicSvgNft, MockV3Aggregator } from "../../typechain-types"

const highTokenUri =
    "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZULCAiZGVzY3JpcHRpb24iOiJBbiBORlQgdGhhdCBjaGFuZ2VzIGJhc2VkIG9uIGNoYWlubGluayBmZWVkIiJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJjb29sbmVzcyIsICJ2YWx1ZSI6IDEwMH1dLCAiaW1hZ2VzIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJ6ZEdGdVpHRnNiMjVsUFNKdWJ5SS9QZ284YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWswMU1USWdOalJETWpZMExqWWdOalFnTmpRZ01qWTBMallnTmpRZ05URXljekl3TUM0MklEUTBPQ0EwTkRnZ05EUTRJRFEwT0MweU1EQXVOaUEwTkRndE5EUTRVemMxT1M0MElEWTBJRFV4TWlBMk5IcHRNQ0E0TWpCakxUSXdOUzQwSURBdE16Y3lMVEUyTmk0MkxUTTNNaTB6TnpKek1UWTJMall0TXpjeUlETTNNaTB6TnpJZ016Y3lJREUyTmk0MklETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaUF6TnpKNklpOCtDaUFnUEhCaGRHZ2dabWxzYkQwaUkwVTJSVFpGTmlJZ1pEMGlUVFV4TWlBeE5EQmpMVEl3TlM0MElEQXRNemN5SURFMk5pNDJMVE0zTWlBek56SnpNVFkyTGpZZ016Y3lJRE0zTWlBek56SWdNemN5TFRFMk5pNDJJRE0zTWkwek56SXRNVFkyTGpZdE16Y3lMVE0zTWkwek56SjZUVEk0T0NBME1qRmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdPVFlnTUNBME9DNHdNU0EwT0M0d01TQXdJREFnTVMwNU5pQXdlbTB6TnpZZ01qY3lhQzAwT0M0eFl5MDBMaklnTUMwM0xqZ3RNeTR5TFRndU1TMDNMalJETmpBMElEWXpOaTR4SURVMk1pNDFJRFU1TnlBMU1USWdOVGszY3kwNU1pNHhJRE01TGpFdE9UVXVPQ0E0T0M0Mll5MHVNeUEwTGpJdE15NDVJRGN1TkMwNExqRWdOeTQwU0RNMk1HRTRJRGdnTUNBd0lERXRPQzA0TGpSak5DNDBMVGcwTGpNZ056UXVOUzB4TlRFdU5pQXhOakF0TVRVeExqWnpNVFUxTGpZZ05qY3VNeUF4TmpBZ01UVXhMalpoT0NBNElEQWdNQ0F4TFRnZ09DNDBlbTB5TkMweU1qUmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdNQzA1TmlBME9DNHdNU0EwT0M0d01TQXdJREFnTVNBd0lEazJlaUl2UGdvZ0lEeHdZWFJvSUdacGJHdzlJaU16TXpNaUlHUTlJazB5T0RnZ05ESXhZVFE0SURRNElEQWdNU0F3SURrMklEQWdORGdnTkRnZ01DQXhJREF0T1RZZ01IcHRNakkwSURFeE1tTXRPRFV1TlNBd0xURTFOUzQySURZM0xqTXRNVFl3SURFMU1TNDJZVGdnT0NBd0lEQWdNQ0E0SURndU5HZzBPQzR4WXpRdU1pQXdJRGN1T0MwekxqSWdPQzR4TFRjdU5DQXpMamN0TkRrdU5TQTBOUzR6TFRnNExqWWdPVFV1T0MwNE9DNDJjemt5SURNNUxqRWdPVFV1T0NBNE9DNDJZeTR6SURRdU1pQXpMamtnTnk0MElEZ3VNU0EzTGpSSU5qWTBZVGdnT0NBd0lEQWdNQ0E0TFRndU5FTTJOamN1TmlBMk1EQXVNeUExT1RjdU5TQTFNek1nTlRFeUlEVXpNM3B0TVRJNExURXhNbUUwT0NBME9DQXdJREVnTUNBNU5pQXdJRFE0SURRNElEQWdNU0F3TFRrMklEQjZJaTgrQ2p3dmMzWm5QZ289In0="
const lowTokenUri =
    "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZULCAiZGVzY3JpcHRpb24iOiJBbiBORlQgdGhhdCBjaGFuZ2VzIGJhc2VkIG9uIGNoYWlubGluayBmZWVkIiJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJjb29sbmVzcyIsICJ2YWx1ZSI6IDEwMH1dLCAiaW1hZ2VzIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCMmFXVjNRbTk0UFNJd0lEQWdNakF3SURJd01DSWdkMmxrZEdnOUlqUXdNQ0lnSUdobGFXZG9kRDBpTkRBd0lpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHhqYVhKamJHVWdZM2c5SWpFd01DSWdZM2s5SWpFd01DSWdabWxzYkQwaWVXVnNiRzkzSWlCeVBTSTNPQ0lnYzNSeWIydGxQU0ppYkdGamF5SWdjM1J5YjJ0bExYZHBaSFJvUFNJeklpOCtDaUFnUEdjZ1kyeGhjM005SW1WNVpYTWlQZ29nSUNBZ1BHTnBjbU5zWlNCamVEMGlOakVpSUdONVBTSTRNaUlnY2owaU1USWlMejRLSUNBZ0lEeGphWEpqYkdVZ1kzZzlJakV5TnlJZ1kzazlJamd5SWlCeVBTSXhNaUl2UGdvZ0lEd3ZaejRLSUNBOGNHRjBhQ0JrUFNKdE1UTTJMamd4SURFeE5pNDFNMk11TmprZ01qWXVNVGN0TmpRdU1URWdOREl0T0RFdU5USXRMamN6SWlCemRIbHNaVDBpWm1sc2JEcHViMjVsT3lCemRISnZhMlU2SUdKc1lXTnJPeUJ6ZEhKdmEyVXRkMmxrZEdnNklETTdJaTgrQ2p3dmMzWm5QZz09In0="

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
                  const mock = await dynamicNft.getPriceFeed()
                  assert.equal(contractName, "Dynamic SVG NFT")
                  assert.equal(contractSymbol, "DSN")
                  assert.equal(mock, aggrMock.address)
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

          describe("mintNft", () => {
              it("mint successfully", async () => {
                  const args = BigNumber.from(2000)
                  expect(await dynamicNft.mintNft(args)).to.emit(dynamicNft, "CreatedNft")
              })
          })

          describe("tokenURI", () => {
              it("assign the correct tokenURI for low price mint", async () => {
                  const tx = await dynamicNft.mintNft(parseEther("1000"))
                  const txReceipt = await tx.wait()
                  const tokenId = await txReceipt.events![1].args!.tokenId
                  const tokenUriResponse = await dynamicNft.tokenURI(tokenId)

                  assert.equal(tokenUriResponse, lowTokenUri)
              })

              it("assign the correct tokenURI for high price mint", async () => {
                  const tx = await dynamicNft.mintNft(parseEther("3000"))
                  const txReceipt = await tx.wait()
                  const tokenId = await txReceipt.events![1].args!.tokenId
                  const tokenUriResponse = await dynamicNft.tokenURI(tokenId)

                  assert.equal(tokenUriResponse, highTokenUri)
              })
          })
      })
