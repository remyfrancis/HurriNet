export interface User {
    id: string
    name: string
    email: string
    image: string
    location: string
}

export interface Resource {
    id: string;
    name: string;
    type: 'SHELTER' | 'MEDICAL' | 'SUPPLIES' | 'WATER';
    status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    capacity?: number;
    currentCount?: number;
    lastUpdate: string;
    contact?: string;
    currentWorkload?: number;
}

