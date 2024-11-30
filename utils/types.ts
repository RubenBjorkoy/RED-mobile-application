export interface LocationProps {
    latitude: number;
    longitude: number;
}

export interface MarkerProps {
    coordinate: LocationProps;
    title: string;
}

export interface ErrorProps {
    id?: string;
    title: string;
    image: string;
    system: string;
    subsystem: string;
    location: LocationProps;
    timestamp: number;
    resolved: string;
    user: string;
}

export interface PictureProps { //Used for storing the images in the json file
    uri: string;
    base64: string;
}

export interface ImageProps {
    id: number;
    image: string;
}

export interface User {
    id?: string;
    username: string;
    password: string;
    group: string;
    role: string;
    language: string;
}

export interface CommentProps {
    id?: string;
    errorId: string;
    user: string;
    comment: string;
    timestamp: number;
}

export interface Filter {
    search?: string;
    system?: string;
    subsystem?: string;
}