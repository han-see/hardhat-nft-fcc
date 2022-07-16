import path from "path"
import pinataSDK from "@pinata/sdk"
import fs from "fs"

export async function storeImages(imagesFilePath: string) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []

     
}
