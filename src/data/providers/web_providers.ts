import type { Matrix } from "mathjs";
import type { DataProvider } from "./providers";

import axios, { type AxiosResponse } from "axios";
import type { Pose } from "../models/landmark";

export class WebProvider implements DataProvider {
    server: string;

    constructor(server: string) {
        this.server = server
    }

    async getImages(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath +'/images';
        return axios.get(path)
    }

    getFullImage(objectPath: string, imageName : string): string {
        const path = this.server + "/" + objectPath + '/' + imageName + "/full-image"
        return path
    }

    getThumbnail(objectPath: string, imageName : string): string {
        const path = this.server + "/" + objectPath + '/' + imageName + "/thumbnail"
        return path
    }

    async getDepthmap(objectPath: string, imageName : string): Promise<string> {
        const path = this.server + "/" + objectPath + '/' + imageName + "/depthmap"
        return axios.get(path).then((res) => res.data)
    }

    async getLayers(objectPath: string, imageName : string): Promise<string> {
        const path = this.server + "/" + objectPath + '/' + imageName + "/layers"
        return axios.get(path).then((res) => res.data)
    }
}