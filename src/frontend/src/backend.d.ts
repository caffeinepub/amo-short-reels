import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VideoReel {
    id: bigint;
    title: string;
    creator: Principal;
    thumbnailUrl: string;
    hashtags: Array<string>;
    createdAt: Time;
    caption: string;
    sharesCount: bigint;
    commentsCount: bigint;
    likesCount: bigint;
    musicName: string;
    videoUrl: string;
    viewsCount: bigint;
    musicArtist: string;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    creator: Principal;
    createdAt: Time;
    text: string;
    videoId: bigint;
}
export interface Notification {
    id: bigint;
    notificationType: {
        __kind__: "newFollower";
        newFollower: Principal;
    } | {
        __kind__: "newComment";
        newComment: {
            commentId: bigint;
            reelId: bigint;
        };
    } | {
        __kind__: "newLike";
        newLike: {
            likerId: Principal;
            reelId: bigint;
        };
    };
    createdAt: Time;
    user: Principal;
}
export interface UserProfile {
    bio: string;
    username: string;
    displayName: string;
    followersCount: bigint;
    totalLikes: bigint;
    avatarUrl: string;
    followingCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookmarkReel(videoId: bigint): Promise<void>;
    commentOnReel(videoId: bigint, text: string): Promise<bigint>;
    createVideoReel(title: string, caption: string, videoUrl: string, thumbnailUrl: string, hashtags: Array<string>, musicName: string, musicArtist: string): Promise<bigint>;
    followUser(userId: Principal): Promise<void>;
    getBookmarks(): Promise<Array<VideoReel>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(videoId: bigint): Promise<Array<Comment>>;
    getFeed(offset: bigint, limit: bigint): Promise<Array<VideoReel>>;
    getFollowingFeed(offset: bigint, limit: bigint): Promise<Array<VideoReel>>;
    getNotifications(): Promise<Array<Notification>>;
    getTrendingHashtags(limit: bigint): Promise<Array<string>>;
    getTrendingReels(limit: bigint): Promise<Array<VideoReel>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVideoReels(userId: Principal): Promise<Array<VideoReel>>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchReels(searchTerm: string): Promise<Array<VideoReel>>;
    unbookmarkReel(videoId: bigint): Promise<void>;
    unfollowUser(userId: Principal): Promise<void>;
    unlikeVideo(videoId: bigint): Promise<void>;
    updateProfile(displayName: string, bio: string, avatarUrl: string): Promise<void>;
}
