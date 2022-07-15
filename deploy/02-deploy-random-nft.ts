import { BigNumber } from "ethers"
import { parseEther } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../typechain-types"
import { verify } from "../utils/verify"

const VRF_SUB_FUND_AMOUNT = parseEther("30") // 30 Link

const deployRandomNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const currentNetworkConfig = networkConfig[network.name]
    const gasLane: string = currentNetworkConfig.gasLane
    const callBackGasLimit: string = currentNetworkConfig.callBackGasLimit
    // fix this
    const dogTokenUris: string[] = ["a", "b", "c"]
    const mintFee: BigNumber = currentNetworkConfig.mintFee
    let vrfCoordinatorV2Address, subscriptionId: string

    log("Initiating vrf parameter")

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait(1)
        subscriptionId = txReceipt.events![0].args!.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = currentNetworkConfig.vrfCoordinatorV2!
        subscriptionId = currentNetworkConfig.subscriptionId!
    }

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasLane,
        callBackGasLimit,
        dogTokenUris,
        mintFee,
    ]

    log("Deploying contract")

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: currentNetworkConfig.blockConfirmations || 0,
    })

    log("Contract deployed")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying contract")
        await verify(randomIpfsNft.address, args)
        log("Contract verified")
    }
    log("Finished")
}

export default deployRandomNft
deployRandomNft.tags = ["randomNft", "all"]
