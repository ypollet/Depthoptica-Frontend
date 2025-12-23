import type { Matrix } from "mathjs";
import type { DataProvider } from "./providers";

import axios, { type AxiosResponse } from "axios";
import type { Pose } from "../models/landmark";
import type { Coordinates } from "../models/coordinates";

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

    async computeLandmark(objectPath: string, imageName : string, pose : Coordinates): Promise<Pose> {
        const path = this.server + "/" + objectPath + '/' + imageName + "/position"
        return axios.post(path, pose)
    }
}