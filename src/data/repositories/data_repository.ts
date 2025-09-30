import type { Repository } from "./repository";
import type { ProjectData, StackImage } from "../models/stack_image";

import type { DataProvider } from "../providers/providers";
import type { Positions } from "../models/coordinates";
import type { Pose } from "../models/landmark";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }
    computeLandmarkPosition(objectPath: string, pose: Pose) : Promise<Positions> {
        return this.provider.computeLandmarkPosition(objectPath, pose).then((rest) => {
            return rest.data as Positions
        })
    }

    async getImages(objectPath: string): Promise<ProjectData> {
        console.log("Repo images")
        return this.provider.getImages(objectPath).then((res) => {
            console.log("received images")
            let data = res.data as ProjectData
            console.log(res.data)
            data.images.forEach((image) => {
                console.log(image)
                image.image = this.getFullImage(objectPath, image.name)
                if(data.thumbnails){
                    image.thumbnail = this.getThumbnail(objectPath, image.name)
                }
                if(image.depthmap != undefined){
                    console.log("get depthmap")
                    image.depthmap = this.getDepthmap(objectPath, image.name)
                }
                if(image.layers != undefined){
                    console.log("get layers")
                    image.layers = this.getLayers(objectPath, image.name)
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

    getDepthmap(objectPath: string, imageName: string): string {
        return this.provider.getDepthmap(objectPath, imageName)
    }

    getLayers(objectPath: string, imageName: string): string {
        return this.provider.getLayers(objectPath, imageName)
    }
}