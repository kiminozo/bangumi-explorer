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

export interface AccessToken {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
    user_id: string;
}

export interface Avatar {
    large: string;
    medium: string;
    small: string;
}

export interface User {
    id: number;
    url: string;
    username: string;
    nickname: string;
    avatar: Avatar;
    sign: string;
    usergroup: number;
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

const baseUrl = "https://api.bgm.tv/";

export async function accessToken(redirect_uri: string, code: string, state?: string): Promise<AccessToken | null> {
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
        if (res.status === 200) {
            console.log("oauth res:" + res.data);
            return res.data;
        } else {
            console.error("oauth res:" + res.status);
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }

}

export async function getUser(name: string): Promise<User | null> {
    try {
        const res = await axios.get<User>(baseUrl + "/user/" + name);
        console.log("user:" + JSON.stringify(res.data));
        return res.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

