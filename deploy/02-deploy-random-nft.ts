import { BigNumber } from "ethers"
import { parseEther } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { VRFCoordinatorV2Mock } from "../typechain-types"
import { MetadataTemplate } from "../utils/interface"
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata"
import { verify } from "../utils/verify"

const VRF_SUB_FUND_AMOUNT = parseEther("30") // 30 Link

const imagesLocation = "./images/randomNft/"

const metadataTemplate: MetadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

const deployRandomNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const currentNetworkConfig = networkConfig[network.name]
    const gasLane: string = currentNetworkConfig.gasLane
    const callBackGasLimit: string = currentNetworkConfig.callBackGasLimit
    const mintFee: BigNumber = currentNetworkConfig.mintFee
    let vrfCoordinatorV2Address, subscriptionId: string
    let tokenUris

    if (process.env.UPLOAD_TO_PINATA == "true") {
        await storeImages(imagesLocation)
    }

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
        tokenUris,
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

async function handleTokenUris(imagesLocation: string) {
    const tokenUris: string[] = []

    const { responses, files } = await storeImages(imagesLocation)

    for (let i in responses) {
        let tokenUriMetadata = { ...metadataTemplate }

        tokenUriMetadata.name = files[i].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${responses[i].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        storeTokenUriMetadata(tokenUriMetadata)
    }

    return tokenUris
}

export default deployRandomNft
deployRandomNft.tags = ["randomNft", "all"]
