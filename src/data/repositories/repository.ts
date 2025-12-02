import type { ProjectData } from "@/data/models/stack_image";
import type { Pose } from "@/data/models/landmark";
import type { DistanceVectors } from "@/data/models/coordinates";

export interface Repository {
    getImages : (objectPath:string) => Promise<ProjectData>;
    getFullImage : (objectPath:string, imageName : string) => string;
    getThumbnail : (objectPath:string, imageName : string) => string;
    getDepthmap : (objectPath:string, imageName : string) => Promise<string>;
    getLayers : (objectPath:string, imageName : string) => Promise<string>;
}