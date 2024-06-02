import {ApiUploadResponse, type Data} from "../types"
import { API_HOST } from '../config' 

export const uploadFile = async (file: File) : Promise<[Error? , Data?]> => {
    try {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(`${API_HOST}/api/files`, {
            method: "POST",
            body: formData
        })

        if(!response.ok) {
          return [new Error(`Upload failed: ${response.statusText}`)]
        }
        const json = await response.json() as ApiUploadResponse
        return [undefined, json.data]
    } catch (error) {
        if(error instanceof Error) {
            return [error]
        }
        return [new Error("Unknown error")]
      }
}