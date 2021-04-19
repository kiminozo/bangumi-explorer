
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

