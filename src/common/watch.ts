import { Item } from "./bangumi";

export type WatchType = 'collect' | 'wish' | 'do' | 'on_hold' | 'dropped'

export interface WatchInfo {
    id: number;
    title: string;
    type: WatchType;
}

export interface UserWatchInfo {
    id: number;
    name: string;
    watches: WatchInfo[];
}

export interface UserItem {
    watchType?: WatchType;
}

export interface StoreInfo {
    path?: string;
    disk?: string;
    symbol?: string;
}

export type StoreItem = Item & StoreInfo;

export type BgmItem = UserItem & StoreItem;

export interface SearchResult {
    uid?: number
    items: BgmItem[]
}