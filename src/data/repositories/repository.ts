import type { ProjectData } from "@/data/models/stack_image";
import type { Pose } from "../models/landmark";
import type { Coordinates } from "../models/coordinates";

export interface Repository {
    getImages : (objectPath:string) => Promise<ProjectData>;
    getFullImage : (objectPath:string, imageName : string) => string;
    getThumbnail : (objectPath:string, imageName : string) => string;
    computeLandmark : (objectPath: string, imageName : string, pose : Coordinates) => Promise<Pose>;
}