import axios from 'axios';

export interface Images {
    large: string;
    common: string;
    medium: string;
    small: string;
    grid: string;
}

export interface Count {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
}

export interface Rating {
    total: number;
    count: Count;
    score: number;
}

export interface Collection {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
}

export interface Item {
    id: number;
    url: string;
    type: number;
    name: string;
    name_cn: string;
    summary: string;
    air_date: string;
    air_weekday: number;
    images: Images;
    eps: number;
    eps_count: number;
    rating: Rating;
    rank: number;
    collection: Collection;
}

interface AccessTokenReq {
    grant_type: "authorization_code";
    client_id: string;
    client_secret: string;
    code: string;
    redirect_uri: string;
    state?: string;
}

interface AccessToken {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
    user_id: string;
}


const appId = "bgm12835d9fe466616a5";
const appSecret = "f8ff78be428a0642fd0008649394d963";

export function login_url(redirect_uri: string) {
    const url = new URL('https://bgm.tv/oauth/authorize');
    const params = url.searchParams;
    params.append("client_id", appId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
    params.append("state", Math.random().toString())
    return url.toString();
}

export class BangumiAPI {
    token?: AccessToken;

    constructor() {
    }

    async accessToken(redirect_uri: string, code: string, state?: string) {
        const data: AccessTokenReq = {
            grant_type: "authorization_code",
            client_id: appId,
            client_secret: appSecret,
            code,
            redirect_uri, //"http://localhost:3000/callback",
            state
        };
        try {
            const res = await axios.post<AccessToken>("https://bgm.tv/oauth/access_token", data);
            this.token = res.data;
            console.log(this.token);
        } catch (e) {
            console.error(e);
        }

    }
}



