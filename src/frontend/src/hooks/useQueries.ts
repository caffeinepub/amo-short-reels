import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  Notification,
  UserProfile,
  VideoReel,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Feed ──────────────────────────────────────────────────────────────────

export function useFeed(offset = 0, limit = 20) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["feed", offset, limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed(BigInt(offset), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFollowingFeed(offset = 0, limit = 20) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["followingFeed", offset, limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowingFeed(BigInt(offset), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrendingReels(limit = 12) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["trendingReels", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingReels(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchReels(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["searchReels", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchReels(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useTrendingHashtags(limit = 12) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["trendingHashtags", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingHashtags(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────

export function useComments(videoId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", videoId?.toString()],
    queryFn: async () => {
      if (!actor || videoId === null) return [];
      return actor.getComments(videoId);
    },
    enabled: !!actor && !isFetching && videoId !== null,
  });
}

// ─── Notifications ────────────────────────────────────────────────────────

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && user !== null,
  });
}

export function useUserReels(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["userReels", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserVideoReels(userId);
    },
    enabled: !!actor && !isFetching && userId !== null,
  });
}

export function useBookmarks() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoReel[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────

export function useLikeMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      liked,
    }: { videoId: bigint; liked: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (liked) return actor.unlikeVideo(videoId);
      return actor.likeVideo(videoId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["trendingReels"] });
    },
  });
}

export function useCommentMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      text,
    }: { videoId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.commentOnReel(videoId, text);
    },
    onSuccess: (_data, { videoId }) => {
      qc.invalidateQueries({ queryKey: ["comments", videoId.toString()] });
    },
  });
}

export function useBookmarkMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      bookmarked,
    }: { videoId: bigint; bookmarked: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (bookmarked) return actor.unbookmarkReel(videoId);
      return actor.bookmarkReel(videoId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useFollowMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      following,
    }: { userId: Principal; following: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (following) return actor.unfollowUser(userId);
      return actor.followUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCreateReelMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      caption: string;
      videoUrl: string;
      thumbnailUrl: string;
      hashtags: string[];
      musicName: string;
      musicArtist: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createVideoReel(
        params.title,
        params.caption,
        params.videoUrl,
        params.thumbnailUrl,
        params.hashtags,
        params.musicName,
        params.musicArtist,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUpdateProfileMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      bio: string;
      avatarUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfile(
        params.displayName,
        params.bio,
        params.avatarUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
