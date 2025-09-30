export type StackImage = {
    name: string,
    image: string,
    thumbnail: string,
    label: string,
    size: Size,
    layers: string | undefined,
    depthmap: string | undefined,
}

export type ImageName = {
    name: string,
    label: string,

}

export type Size = {
    height: number,
    width: number
}

export type ProjectData = {
    images: Array<StackImage>,
    thumbnails: boolean,
}

export type Ratio = {
    ratioH: number,
    ratioW: number
}