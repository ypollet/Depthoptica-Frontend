import type { Repository } from "./repository";
import type { ProjectData, StackImage } from "../models/stack_image";

import type { DataProvider } from "../providers/providers";
import type { Position } from "../models/coordinates";
import type { Pose } from "../models/landmark";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }
    computeLandmarkPosition(objectPath: string, pose: Pose) : Promise<Position> {
        return this.provider.computeLandmarkPosition(objectPath, pose).then((rest) => {
            return rest.data as Position
        })
    }

    async getImages(objectPath: string): Promise<ProjectData> {
        return this.provider.getImages(objectPath).then((res) => {
            let data = res.data as ProjectData
            data.images = new Map(Object.entries(data.images))
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
}