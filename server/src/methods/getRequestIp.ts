import { Request } from 'express';
import { geolocateIp } from './oauthLogin';

export function getRequestIp(req: Request) {
    return (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
}

export async function getRequestGeolocation(req: Request) {
    try {
        let data = await geolocateIp(getRequestIp(req));
        return data;
    } catch (e) {
        console.error("Error with getRequestGeolocation", e);
        return { city: null, country: null, state: null };
    }
}