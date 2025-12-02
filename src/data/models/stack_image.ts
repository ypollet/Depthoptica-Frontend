export type StackImageData = {
    name: string,
    image: string,
    thumbnail: string,
    label: string,
    size: Size,
    has_layers: boolean,
    has_depthmap: boolean,
    depthMin: number,
    depthMax: number,
    layerThickness: number,
    pixelRatio: Ratio
}
export class StackImage {
    name: string
    image: string
    thumbnail: string
    label: string
    size: Size
    has_layers: boolean
    has_depthmap: boolean
    layers: ImageData | undefined
    depthmap: ImageData | undefined
    depthMin: number
    depthMax: number
    layerThickness: number
    pixelRatio: Ratio

    static fromData(data : StackImageData){
        return new StackImage(
            data.name,
            data.image,
            data.thumbnail,
            data.label,
            data.size,
            data.has_layers,
            data.has_depthmap,
            undefined,
            undefined,
            data.depthMin,
            data.depthMax,
            data.layerThickness,
            data.pixelRatio
        )
    }

    constructor(name: string,
        image: string,
        thumbnail: string,
        label: string,
        size: Size,
        has_layers: boolean,
        has_depthmap: boolean,
        layers: ImageData | undefined,
        depthmap: ImageData | undefined,
        depthMin: number,
        depthMax: number,
        layerThickness: number,
        pixelRatio: Ratio) {
        this.name = name
        this.image = image
        this.thumbnail = thumbnail
        this.label = label
        this.size = size
        this.has_layers = has_layers
        this.has_depthmap = has_depthmap
        this.layers = layers
        this.depthmap = depthmap
        this.depthMin = depthMin
        this.depthMax = depthMax
        this.layerThickness = layerThickness
        this.pixelRatio = pixelRatio
    }

    toJSON() {
        return {
            name: this.name,
            image: this.image,
            thumbnail: this.thumbnail,
            label: this.label,
            size: this.size,
            has_layers: this.has_layers,
            has_depthmap: this.has_depthmap,
            layers: undefined,
            depthmap: undefined,
            depthMin: this.depthMin,
            depthMax: this.depthMax,
            layerThickness: this.layerThickness,
            pixelRatio: this.pixelRatio
        }
    }
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
    images: Array<StackImageData>,
    thumbnails: boolean,
}

export type Ratio = {
    height: number,
    width: number
}