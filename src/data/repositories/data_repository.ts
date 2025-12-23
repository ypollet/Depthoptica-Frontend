import type { Repository } from "./repository";
import  { type ProjectData } from "../models/stack_image";

import type { DataProvider } from "../providers/providers";
import type { Coordinates, DistanceVectors } from "../models/coordinates";
import type { Pose } from "../models/landmark";
import { X } from "lucide-vue-next";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }

    async getImages(objectPath: string): Promise<ProjectData> {
        return this.provider.getImages(objectPath).then((res) => {
            let data = res.data as ProjectData
            
            data.images.forEach((image) => {
                image.image = this.getFullImage(objectPath, image.name)
                if(data.thumbnails){
                    image.thumbnail = this.getThumbnail(objectPath, image.name)
                }               
            })

            return data
        })
    }

    getFullImage(objectPath: string, imageName: string): string {
        return this.provider.getFullImage(objectPath, imageName)
    }

    getThumbnail(objectPath: string, imageName: string): string {
        return this.provider.getThumbnail(objectPath, imageName)
    }

    async computeLandmark(objectPath: string, imageName : string, pose : Coordinates): Promise<Pose> {
        return this.provider.computeLandmark(objectPath, imageName, pose)
    }

}