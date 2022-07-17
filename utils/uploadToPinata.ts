import pinataSDK, { PinataPinResponse } from "@pinata/sdk"
import * as fs from "fs"
import * as path from "path"
import { MetadataTemplate, PinataResponse } from "./interface"

const pinataApiKey = process.env.PINATA_API_KEY!
const pinataApiSecret = process.env.PINATA_API_SECRET!
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

export async function storeImages(imagesFilePath: string): Promise<PinataResponse> {
    const fullImagesPath = path.resolve(imagesFilePath)
    console.log(fullImagesPath)
    const files = fs.readdirSync(fullImagesPath)
    let responses: PinataPinResponse[] = []

    console.log("Uploading to Pinata...")
    for (let i in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[i]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (err) {
            console.log(err)
        }
    }
    console.log("Upload finished")
    return { responses, files }
}

export async function storeTokenUriMetadata(
    metadata: MetadataTemplate
): Promise<PinataPinResponse | undefined> {
    try {
        console.log("Uploading token metadata to Pinata")
        const response = await pinata.pinJSONToIPFS(metadata)
        console.log("Finish uploading tokenmetadata")
        return response
    } catch (err) {
        console.log(err)
    }
}
