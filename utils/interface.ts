import { PinataPinResponse } from "@pinata/sdk"

export interface MetadataTemplate {
    name: string
    description: string
    image: string
    attributes?: any
}

export interface PinataResponse {
    responses: PinataPinResponse[]
    files: string[]
}
