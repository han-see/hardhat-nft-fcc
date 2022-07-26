import { BigNumber } from "ethers"
import { ethers, getNamedAccounts, network } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DynamicSvgNft, RandomIpfsNft } from "../typechain-types"

const mintNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts()

    //Random IpfsNft
    const randomIpfsNft: RandomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftTxReceipt = await randomIpfsNftTx.wait(1)

    await new Promise(async (resolve) => {
        setTimeout(resolve, 300000)
        randomIpfsNft.once("NftMinted", () => {
            resolve("")
        })
        if (network.config.chainId == 31337) {
            const requestId = randomIpfsNftTxReceipt.events![1].args!.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    console.log(`Random Ipfs NFT minted, ${randomIpfsNftTxReceipt.transactionHash}`)

    //Dynamic Nft mint
    const dynamicNft: DynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const tx = await dynamicNft.mintNft(BigNumber.from("100014000000"))
    const txReceipt = await tx.wait(1)
    console.log(`Dynamic NFT minted, ${txReceipt.transactionHash}`)
}

export default mintNft
mintNft.tags = ["all", "mint"]
