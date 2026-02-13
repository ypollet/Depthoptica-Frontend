import type { DataProvider } from "./providers";

import axios, { type AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";
import type { Profile } from "../models/profile";

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

    async computeLandmark(objectPath: string, imageName : string, pose : Coordinates): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath + '/' + imageName + "/position?x=" + pose.x + "&y=" + pose.y
        return axios.get(path)
    }

    async computeProfile(objectPath: string, imageName : string, start : Coordinates, end : Coordinates): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath + '/' + imageName + "/profile?x1=" + start.x + "&y1=" + start.y + "&x2=" + end.x + "&y2=" + end.y
        return axios.get(path)
    }
}