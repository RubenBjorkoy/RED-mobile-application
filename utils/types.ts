export interface LocationProps {
    latitude: number;
    longitude: number;
}

export interface MarkerProps {
    coordinate: LocationProps;
    title: string;
}

export interface ErrorProps {
    title: string;
    image: string;
    system: string;
    subsystem: string;
    location: LocationProps;
    timestamp: number;
    resolved: boolean;
    user: string;
}

export interface PictureProps {
    uri: string;
    base64: string;
}

export interface ImageProps {
    id: number;
    image: string;
}