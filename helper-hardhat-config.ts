import { BigNumber, ethers } from "ethers"
import { parseEther } from "ethers/lib/utils"

export interface networkConfigItem {
    vrfCoordinatorV2?: string
    blockConfirmations?: number
    entraceFee: BigNumber
    gasLane: string
    subscriptionId?: string
    callBackGasLimit: string
    interval: string
    mintFee: BigNumber
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    rinkeby: {
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        blockConfirmations: 6,
        entraceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "6738",
        callBackGasLimit: "500000", // 500,000
        interval: "30",
        mintFee: parseEther("0.1"),
    },
    hardhat: {
        blockConfirmations: 1,
        entraceFee: ethers.utils.parseEther("0.1"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackGasLimit: "500000", // 500,000
        interval: "30",
        mintFee: parseEther("1"),
    },
}

export const developmentChains: string[] = ["hardhat", "localhost"]
