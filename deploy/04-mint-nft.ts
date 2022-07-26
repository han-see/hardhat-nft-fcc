import { BigNumber } from "ethers"
import { ethers, getNamedAccounts } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DynamicSvgNft } from "../typechain-types"

const mintNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts()

    //Dynamic Nft mint
    const dynamicNft: DynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const tx = await dynamicNft.mintNft(BigNumber.from("100014000000"))
    const txReceipt = await tx.wait(1)
    console.log(`Dynamic NFT minted, ${txReceipt.transactionHash}`)
}

export default mintNft
mintNft.tags = ["mint"]
