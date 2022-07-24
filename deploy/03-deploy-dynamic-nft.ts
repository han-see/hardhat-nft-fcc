import * as fs from "fs"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const deployDynamicNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const currentNetworkConfig = networkConfig[network.name]
    let ethUsdPriceFeedAddress
    const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" })
    const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" })

    log("Deploying dynamic NFT contract")

    if (network.config.chainId == 31337) {
        const EthUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = currentNetworkConfig.ethUsdPriceFeedAddress!
    }

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]

    const dynamicNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: currentNetworkConfig.blockConfirmations || 0,
    })

    log("Contract successfully deployed")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifiying contract")
        await verify(dynamicNft.address, args)
        log("Contract verified")
    }
}

export default deployDynamicNft
deployDynamicNft.tags = ["all", "dynamicNft"]
