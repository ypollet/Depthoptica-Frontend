import type { Repository } from "./repository";
import  { type ProjectData } from "../models/stack_image";

import type { DataProvider } from "../providers/providers";
import type { Coordinates, Coords3D } from "../models/coordinates";
import type { Profile, ProfileLandmarks } from "../models/profile";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }

    async getImages(objectPath: string): Promise<ProjectData> {
        return this.provider.getImages(objectPath).then((res) => {
            let data = res.data as ProjectData
            console.log(data)
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

    async computeLandmark(objectPath: string, imageName : string, pose : Coordinates): Promise<Coords3D> {
        return this.provider.computeLandmark(objectPath, imageName, pose).then((res) => {
            return res.data as Coords3D
        })
    }

    async computeProfile(objectPath: string, imageName : string, profile : Profile): Promise<ProfileLandmarks | undefined> {
        if(!profile.landmarks.isFull()){
            return undefined
        }
        return this.provider.computeProfile(objectPath, imageName, profile.landmarks.first!.pos, profile.landmarks.last!.pos).then((res) => {
            return res.data as ProfileLandmarks
        })
    }

}