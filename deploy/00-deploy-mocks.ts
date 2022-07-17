import { parseEther, parseUnits } from "ethers/lib/utils"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"

const BASE_FEE = parseEther("0.25") // 0.25 Link is the premium per Request in Rinkeby Network
const GAS_PRICE_LINK = parseUnits("1", "gwei")

const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Testnet detected. Deploying VRF mocks")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
        })
        log("VRF Deployment successfull")
        log("--------------------")
    }
}

export default deployMocks
deployMocks.tags = ["mocks", "all", "randomNft"]
