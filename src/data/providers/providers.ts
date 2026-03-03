import type { AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";

export interface DataProvider {
        getImages: (objectPath: string) => Promise<AxiosResponse>;
        getFullImage : (objectPath:string, imageName : string) => string;
        getThumbnail : (objectPath:string, imageName : string) => string;
        computeLandmark : (objectPath: string, imageName : string, pose : Coordinates) => Promise<AxiosResponse>;
        computeProfile : (objectPath: string, imageName : string, start : Coordinates, end : Coordinates, edgeThreshold? : string | undefined) => Promise<AxiosResponse>;
}
