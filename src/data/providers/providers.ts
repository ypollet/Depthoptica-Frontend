import type { AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";
import type { Profile } from "../models/profile";

export interface DataProvider {
        getImages: (objectPath: string) => Promise<AxiosResponse>;
        getFullImage : (objectPath:string, imageName : string) => string;
        getThumbnail : (objectPath:string, imageName : string) => string;
        computeLandmark : (objectPath: string, imageName : string, pose : Coordinates) => Promise<AxiosResponse>;
        computeProfile : (objectPath: string, imageName : string, start : Coordinates, end : Coordinates, nbr_steps : number) => Promise<AxiosResponse>;
}
