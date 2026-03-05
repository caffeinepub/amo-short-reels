import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  public type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : Text;
    followersCount : Nat;
    followingCount : Nat;
    totalLikes : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.username, profile2.username);
    };
  };

  public type VideoReel = {
    id : Nat;
    title : Text;
    caption : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    hashtags : [Text];
    musicName : Text;
    musicArtist : Text;
    likesCount : Nat;
    commentsCount : Nat;
    sharesCount : Nat;
    viewsCount : Nat;
    creator : Principal;
    createdAt : Time.Time;
  };

  module VideoReel {
    public func compare(video1 : VideoReel, video2 : VideoReel) : Order.Order {
      Int.compare(video1.likesCount, video2.likesCount);
    };
  };

  public type Comment = {
    id : Nat;
    text : Text;
    creator : Principal;
    createdAt : Time.Time;
    videoId : Nat;
  };

  public type Notification = {
    id : Nat;
    user : Principal;
    notificationType : {
      #newFollower : Principal;
      #newLike : { reelId : Nat; likerId : Principal };
      #newComment : { reelId : Nat; commentId : Nat };
    };
    createdAt : Time.Time;
  };

  var nextVideoId = 0;
  var nextCommentId = 0;
  var nextNotificationId = 0;
  var nextUserId = 0;

  // Internal helpers
  func createVideoId() : Nat {
    let id = nextVideoId;
    nextVideoId += 1;
    id;
  };

  // Storage
  let users = Map.empty<Principal, UserProfile>();
  let videoReels = Map.empty<Nat, VideoReel>();
  let comments = Map.empty<Nat, Comment>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let userFollowers = Map.empty<Principal, Set.Set<Principal>>();
  let userFollowing = Map.empty<Principal, Set.Set<Principal>>();
  let userLikes = Map.empty<Nat, Set.Set<Principal>>();
  let userBookmarks = Map.empty<Principal, Set.Set<Nat>>();
  let userTotalLikes = Map.empty<Principal, Nat>();

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Anyone can view public profiles, but admins can view any profile
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public shared ({ caller }) func createVideoReel(title : Text, caption : Text, videoUrl : Text, thumbnailUrl : Text, hashtags : [Text], musicName : Text, musicArtist : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create video reels");
    };

    let id = createVideoId();
    let reel : VideoReel = {
      id;
      title;
      caption;
      videoUrl;
      thumbnailUrl;
      hashtags;
      musicName;
      musicArtist;
      likesCount = 0;
      commentsCount = 0;
      sharesCount = 0;
      viewsCount = 0;
      creator = caller;
      createdAt = Time.now();
    };

    videoReels.add(id, reel);
    id;
  };

  public shared ({ caller }) func likeVideo(videoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };

    switch (videoReels.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let userLikesSet = switch (userLikes.get(videoId)) {
          case (null) { Set.singleton(caller) };
          case (?set) {
            if (set.contains(caller)) { return () } else {
              set.add(caller);
              set;
            };
          };
        };
        userLikes.add(videoId, userLikesSet);

        let video = switch (videoReels.get(videoId)) {
          case (null) { Runtime.trap("Video not found") };
          case (?v) { v };
        };
        let updatedVideo = {
          video with
          likesCount = video.likesCount + 1;
        };
        videoReels.add(videoId, updatedVideo);

        // Update creator's total likes
        let creatorLikes = switch (userTotalLikes.get(video.creator)) {
          case (null) { 0 };
          case (?likes) { likes };
        };
        userTotalLikes.add(video.creator, creatorLikes + 1);

        let _ = newLikeNotification(caller, videoId);
      };
    };
  };

  public shared ({ caller }) func unlikeVideo(videoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike videos");
    };

    switch (videoReels.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let userLikesSet = switch (userLikes.get(videoId)) {
          case (null) { return () };
          case (?set) {
            if (not set.contains(caller)) { return () } else {
              set.remove(caller);
              set;
            };
          };
        };
        userLikes.add(videoId, userLikesSet);

        let updatedVideo = {
          video with
          likesCount = if (video.likesCount > 0) { video.likesCount - 1 } else { 0 };
        };
        videoReels.add(videoId, updatedVideo);

        // Update creator's total likes
        let creatorLikes = switch (userTotalLikes.get(video.creator)) {
          case (null) { 0 };
          case (?likes) { if (likes > 0) { likes - 1 } else { 0 } };
        };
        userTotalLikes.add(video.creator, creatorLikes);
      };
    };
  };

  public shared ({ caller }) func commentOnReel(videoId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on reels");
    };

    switch (videoReels.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let commentId = nextCommentId;
        nextCommentId += 1;
        let comment : Comment = {
          id = commentId;
          text;
          creator = caller;
          createdAt = Time.now();
          videoId;
        };
        comments.add(commentId, comment);

        let video = switch (videoReels.get(videoId)) {
          case (null) { Runtime.trap("Video not found") };
          case (?v) { v };
        };
        let updatedVideo = {
          video with
          commentsCount = video.commentsCount + 1;
        };
        videoReels.add(videoId, updatedVideo);

        let _ = newCommentNotification(commentId, videoId);
        commentId;
      };
    };
  };

  public shared ({ caller }) func followUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow other users");
    };

    if (caller == userId) {
      Runtime.trap("Cannot follow yourself");
    };

    let userFollowersSet = switch (userFollowers.get(userId)) {
      case (null) { Set.singleton(caller) };
      case (?set) {
        if (set.contains(caller)) { return () } else {
          set.add(caller);
          set;
        };
      };
    };
    userFollowers.add(userId, userFollowersSet);

    let followersCount = userFollowersSet.size();
    let userProfile = switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    let updatedProfile = {
      userProfile with
      followersCount;
    };
    users.add(userId, updatedProfile);

    let userFollowingSet = switch (userFollowing.get(caller)) {
      case (null) { Set.singleton(userId) };
      case (?set) {
        set.add(userId);
        set;
      };
    };
    userFollowing.add(caller, userFollowingSet);

    let followingCount = userFollowingSet.size();
    let callerProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("Caller profile not found") };
      case (?profile) { profile };
    };
    let updatedCallerProfile = {
      callerProfile with
      followingCount;
    };
    users.add(caller, updatedCallerProfile);
    let _ = newFollowerNotification(caller, userId);
  };

  public shared ({ caller }) func unfollowUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow other users");
    };

    if (caller == userId) {
      Runtime.trap("Cannot unfollow yourself");
    };

    let userFollowersSet = switch (userFollowers.get(userId)) {
      case (null) { return () };
      case (?set) {
        if (not set.contains(caller)) { return () } else {
          set.remove(caller);
          set;
        };
      };
    };
    userFollowers.add(userId, userFollowersSet);

    let followersCount = userFollowersSet.size();
    switch (users.get(userId)) {
      case (null) {};
      case (?userProfile) {
        let updatedProfile = {
          userProfile with
          followersCount;
        };
        users.add(userId, updatedProfile);
      };
    };

    let userFollowingSet = switch (userFollowing.get(caller)) {
      case (null) { return () };
      case (?set) {
        set.remove(userId);
        set;
      };
    };
    userFollowing.add(caller, userFollowingSet);

    let followingCount = userFollowingSet.size();
    switch (users.get(caller)) {
      case (null) {};
      case (?callerProfile) {
        let updatedCallerProfile = {
          callerProfile with
          followingCount;
        };
        users.add(caller, updatedCallerProfile);
      };
    };
  };

  public shared ({ caller }) func bookmarkReel(videoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can bookmark reels");
    };

    switch (videoReels.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let bookmarkSet = switch (userBookmarks.get(caller)) {
          case (null) { Set.singleton<Nat>(videoId) };
          case (?set) {
            if (set.contains(videoId)) { return () } else {
              set.add(videoId);
              set;
            };
          };
        };
        userBookmarks.add(caller, bookmarkSet);
      };
    };
  };

  public shared ({ caller }) func unbookmarkReel(videoId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unbookmark reels");
    };

    let bookmarkSet = switch (userBookmarks.get(caller)) {
      case (null) { return () };
      case (?set) {
        if (not set.contains(videoId)) { return () } else {
          set.remove(videoId);
          set;
        };
      };
    };
    userBookmarks.add(caller, bookmarkSet);
  };

  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
    let updatedProfile = {
      userProfile with
      displayName;
      bio;
      avatarUrl;
    };
    users.add(caller, updatedProfile);
  };

  public query ({ caller }) func getFeed(offset : Nat, limit : Nat) : async [VideoReel] {
    // Public feed - anyone can view including guests
    let feed = List.empty<VideoReel>();
    let reels = videoReels.toArray();
    let availableReels = reels.size();
    if (offset >= availableReels) { return [] };
    let start = offset;
    let end = if (offset + limit >= availableReels) { availableReels } else {
      offset + limit;
    };
    for (i in Nat.range(start, end)) {
      switch (videoReels.get(i)) {
        case (null) {};
        case (?reel) { feed.add(reel) };
      };
    };
    feed.toArray();
  };

  public query ({ caller }) func getTrendingReels(limit : Nat) : async [VideoReel] {
    // Public trending - anyone can view including guests
    let reels = videoReels.values().toArray().sort().sliceToArray(0, limit);
    reels.sliceToArray(0, limit);
  };

  public query ({ caller }) func getBookmarks() : async [VideoReel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookmarks");
    };

    let bookmarksSet = switch (userBookmarks.get(caller)) {
      case (null) { return [] };
      case (?set) { set };
    };
    let bookmarks = List.empty<VideoReel>();
    for (videoId in bookmarksSet.values()) {
      switch (videoReels.get(videoId)) {
        case (null) {};
        case (?reel) { bookmarks.add(reel) };
      };
    };
    bookmarks.toArray();
  };

  public query ({ caller }) func searchReels(searchTerm : Text) : async [VideoReel] {
    // Public search - anyone can search including guests
    let results = List.empty<VideoReel>();
    for ((_, reel) in videoReels.entries()) {
      if (reel.title.contains(#text searchTerm) or reel.caption.contains(#text searchTerm)) {
        results.add(reel);
      } else {
        for (hashtag in reel.hashtags.values()) {
          if (hashtag.contains(#text searchTerm)) {
            results.add(reel);
          };
        };
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getUserVideoReels(userId : Principal) : async [VideoReel] {
    // Public - anyone can view user's reels
    let userVideoReels = List.empty<VideoReel>();
    for ((_, reel) in videoReels.entries()) {
      if (reel.creator == userId) {
        userVideoReels.add(reel);
      };
    };
    userVideoReels.toArray();
  };

  public query ({ caller }) func getFollowingFeed(offset : Nat, limit : Nat) : async [VideoReel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their following feed");
    };

    let followingSet = switch (userFollowing.get(caller)) {
      case (null) { return [] };
      case (?set) { set };
    };

    let feed = List.empty<VideoReel>();
    for ((_, reel) in videoReels.entries()) {
      if (followingSet.contains(reel.creator)) {
        feed.add(reel);
      };
    };

    let feedArray = feed.toArray();
    let availableReels = feedArray.size();
    if (offset >= availableReels) { return [] };
    let start = offset;
    let end = if (offset + limit >= availableReels) { availableReels } else {
      offset + limit;
    };
    feedArray.sliceToArray(start, end);
  };

  public query ({ caller }) func getTrendingHashtags(limit : Nat) : async [Text] {
    // Public - anyone can view trending hashtags
    let hashtagCounts = Map.empty<Text, Nat>();
    for ((_, reel) in videoReels.entries()) {
      for (hashtag in reel.hashtags.values()) {
        let count = switch (hashtagCounts.get(hashtag)) {
          case (null) { 1 };
          case (?c) { c + 1 };
        };
        hashtagCounts.add(hashtag, count);
      };
    };

    let hashtagArray = hashtagCounts.entries().toArray();
    let sortedHashtags = hashtagArray.sort(
      func(a : (Text, Nat), b : (Text, Nat)) : Order.Order {
        Int.compare(b.1, a.1);
      },
    );

    let result = List.empty<Text>();
    let maxIndex = if (sortedHashtags.size() < limit) {
      sortedHashtags.size();
    } else {
      limit;
    };
    for (i in Nat.range(0, maxIndex)) {
      result.add(sortedHashtags[i].0);
    };
    result.toArray();
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func getComments(videoId : Nat) : async [Comment] {
    // Public - anyone can view comments
    switch (videoReels.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let videoComments = List.empty<Comment>();
        for ((_, comment) in comments.entries()) {
          if (comment.videoId == videoId) {
            videoComments.add(comment);
          };
        };
        videoComments.toArray();
      };
    };
  };

  func newFollowerNotification(followerId : Principal, followingId : Principal) : async () {
    let notification : Notification = {
      id = nextNotificationId;
      user = followingId;
      notificationType = #newFollower followerId;
      createdAt = Time.now();
    };
    nextNotificationId += 1;
    let userNotifications = switch (notifications.get(followingId)) {
      case (null) {
        let list = List.singleton<Notification>(notification);
        list;
      };
      case (?list) {
        list.add(notification);
        list;
      };
    };
    notifications.add(followingId, userNotifications);
  };

  func newLikeNotification(likerId : Principal, reelId : Nat) : async () {
    let notification : Notification = {
      id = nextNotificationId;
      user = likerId;
      notificationType = #newLike { reelId; likerId };
      createdAt = Time.now();
    };
    nextNotificationId += 1;
    switch (videoReels.get(reelId)) {
      case (null) { return };
      case (?video) {
        let userNotifications = switch (notifications.get(video.creator)) {
          case (null) {
            let list = List.singleton<Notification>(notification);
            list;
          };
          case (?list) {
            list.add(notification);
            list;
          };
        };
        notifications.add(video.creator, userNotifications);
      };
    };
  };

  func newCommentNotification(commentId : Nat, reelId : Nat) : async () {
    let notification : Notification = {
      id = nextNotificationId;
      user = switch (videoReels.get(reelId)) {
        case (null) { Runtime.trap("Video not found") };
        case (?video) { video.creator };
      };
      notificationType = #newComment { reelId; commentId };
      createdAt = Time.now();
    };
    nextNotificationId += 1;
    switch (videoReels.get(reelId)) {
      case (null) { return };
      case (?video) {
        let userNotifications = switch (notifications.get(video.creator)) {
          case (null) {
            let list = List.singleton<Notification>(notification);
            list;
          };
          case (?list) {
            list.add(notification);
            list;
          };
        };
        notifications.add(video.creator, userNotifications);
      };
    };
  };
};
