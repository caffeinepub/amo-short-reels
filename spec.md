# AMO SHORT REELS APP

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full short video reels platform named "AMO SHORT REELS APP"
- Home feed with vertical scrolling reels (TikTok/Moj style)
- Bottom navigation: Home, Discover/Search, Create (camera), Notifications, Profile
- In-app camera with all active features:
  - Front/back camera toggle
  - Gallery picker to upload from device
  - Flash toggle (on/off/auto)
  - Timer (3s / 10s countdown)
  - Speed controls (0.3x, 0.5x, 1x, 2x, 3x)
  - Beauty/filter mode toggle
  - Grid overlay toggle
  - Flip/mirror button
  - Record button (tap to record, hold to record)
  - Duration selector (15s, 30s, 60s)
  - Effects/filters strip
  - Mute/unmute mic
- Video feed with like, comment, share, bookmark buttons
- Video overlay: creator name, caption, hashtags, music info
- Like animation on double-tap
- User profile page with reels grid, followers/following counts
- Discover page with trending hashtags and search
- Notifications page
- Upload/post reel flow with caption, hashtags, music selection
- Trending music/audio selector for reels
- Comments drawer/sheet
- Follow/unfollow button on profiles
- AMO branding throughout (logo, app name "AMO" prominently)
- Authorization: login/signup flow
- Blob storage for video and image uploads

### Modify
Nothing (new project).

### Remove
Nothing (new project).

## Implementation Plan
1. Select components: authorization, blob-storage, camera
2. Generate backend: user profiles, video posts, likes, comments, follows, notifications
3. Build frontend:
   - App shell with bottom nav
   - Home feed (vertical scroll reels)
   - Camera screen with all active controls
   - Upload/post flow
   - Discover/search page
   - Notifications page
   - Profile page with reels grid
   - Comments drawer
   - Auth screens (login/signup)
4. AMO branding: logo, color scheme, typography
5. Deploy
