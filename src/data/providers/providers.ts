import type { AxiosResponse } from "axios";
import type { Pose } from "../models/landmark";

export interface DataProvider {
        getImages: (objectPath: string) => Promise<AxiosResponse>;
        getFullImage : (objectPath:string, imageName : string) => string;
        getThumbnail : (objectPath:string, imageName : string) => string;
        getDepthmap : (objectPath:string, imageName : string) => Promise<string>;
        getLayers : (objectPath:string, imageName : string) => Promise<string>;
}
