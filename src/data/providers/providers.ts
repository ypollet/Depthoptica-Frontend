import type { AxiosResponse } from "axios";
import type { Pose } from "../models/landmark";
import type { Coordinates } from "../models/coordinates";

export interface DataProvider {
        getImages: (objectPath: string) => Promise<AxiosResponse>;
        getFullImage : (objectPath:string, imageName : string) => string;
        getThumbnail : (objectPath:string, imageName : string) => string;
        computeLandmark : (objectPath: string, imageName : string, pose : Coordinates) => Promise<Pose>;
}
