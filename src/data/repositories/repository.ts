import type { ProjectData } from "@/data/models/stack_image";
import type { Coordinates, Coords3D } from "../models/coordinates";
import type { Profile, ProfileLandmarks } from "../models/profile";

export interface Repository {
    getImages : (objectPath:string) => Promise<ProjectData>;
    getFullImage : (objectPath:string, imageName : string) => string;
    getThumbnail : (objectPath:string, imageName : string) => string;
    computeLandmark : (objectPath: string, imageName : string, pose : Coordinates) => Promise<Coords3D>;
    computeProfile : (objectPath: string, imageName : string, profile : Profile) => Promise<ProfileLandmarks | undefined>;
}