import { MOCK_REELS } from "@/data/mockReels";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallerProfile } from "@/hooks/useQueries";
import {
  Bookmark,
  CheckCircle2,
  Edit3,
  Grid3x3,
  Heart,
  Play,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type ProfileTab = "videos" | "liked" | "saved";

export default function ProfileScreen() {
  const [tab, setTab] = useState<ProfileTab>("videos");
  const [showEditModal, setShowEditModal] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useCallerProfile();

  const principal = identity?.getPrincipal().toString();
  const displayName = profile?.displayName || "AMO Creator";
  const username =
    profile?.username ||
    (principal ? `user_${principal.slice(0, 6)}` : "amo_user");
  const bio = profile?.bio || "Creating magic on AMO! 🎬✨";
  const followers = profile ? Number(profile.followersCount) : 1240;
  const following = profile ? Number(profile.followingCount) : 89;
  const totalLikes = profile ? Number(profile.totalLikes) : 42800;

  const userReels = MOCK_REELS;
  const likedReels = MOCK_REELS.filter((r) => r.isLiked);
  const savedReels = MOCK_REELS.filter((r) => r.isBookmarked);

  const tabReels =
    tab === "videos" ? userReels : tab === "liked" ? likedReels : savedReels;

  return (
    <div
      className="h-full overflow-y-auto scrollbar-hide pb-20"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Header */}
      <div className="relative">
        {/* Gradient background */}
        <div
          className="h-32 w-full"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 290), oklch(0.72 0.28 335), oklch(0.78 0.22 30))",
          }}
        />

        {/* Settings icon */}
        <button
          type="button"
          className="absolute top-12 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.10 0 0 / 0.6)" }}
          onClick={clear}
        >
          <Settings className="w-4 h-4 text-white" />
        </button>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div
            className="w-20 h-20 rounded-full border-3 border-background flex items-center justify-center text-2xl font-black text-white shadow-glow"
            style={{
              background: "var(--amo-gradient)",
              border: "3px solid oklch(0.07 0 0)",
            }}
          >
            {displayName[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 px-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-display font-black text-white">
                {displayName}
              </h1>
              <CheckCircle2
                className="w-5 h-5"
                style={{ color: "oklch(0.65 0.28 290)" }}
              />
            </div>
            <p className="text-sm" style={{ color: "oklch(0.50 0 0)" }}>
              @{username}
            </p>
          </div>
          <button
            type="button"
            data-ocid="profile.edit_button"
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "oklch(0.15 0 0)", color: "white" }}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Bio */}
        <p
          className="text-sm mt-3 leading-relaxed"
          style={{ color: "oklch(0.70 0 0)" }}
        >
          {bio}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-1 mt-4">
          <StatPill value={userReels.length} label="Posts" />
          <div className="w-px h-8" style={{ background: "oklch(0.20 0 0)" }} />
          <StatPill value={followers} label="Followers" />
          <div className="w-px h-8" style={{ background: "oklch(0.20 0 0)" }} />
          <StatPill value={following} label="Following" />
          <div className="w-px h-8" style={{ background: "oklch(0.20 0 0)" }} />
          <StatPill value={formatCount(totalLikes)} label="Likes" />
        </div>
      </div>

      {/* Profile tabs */}
      <div className="flex border-b" style={{ borderColor: "oklch(0.15 0 0)" }}>
        <TabButton
          id="videos"
          active={tab === "videos"}
          onClick={() => setTab("videos")}
          icon={<Grid3x3 className="w-4 h-4" />}
          label="Videos"
          ocid="profile.videos_tab"
        />
        <TabButton
          id="liked"
          active={tab === "liked"}
          onClick={() => setTab("liked")}
          icon={<Heart className="w-4 h-4" />}
          label="Liked"
          ocid="profile.liked_tab"
        />
        <TabButton
          id="saved"
          active={tab === "saved"}
          onClick={() => setTab("saved")}
          icon={<Bookmark className="w-4 h-4" />}
          label="Saved"
          ocid="profile.saved_tab"
        />
      </div>

      {/* Reels grid */}
      <div className="px-1 pt-1">
        {tabReels.length === 0 ? (
          <div
            data-ocid="profile.empty_state"
            className="flex flex-col items-center gap-3 py-12"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.12 0 0)" }}
            >
              <Grid3x3
                className="w-6 h-6"
                style={{ color: "oklch(0.30 0 0)" }}
              />
            </div>
            <p className="text-sm" style={{ color: "oklch(0.40 0 0)" }}>
              {tab === "videos"
                ? "Abhi tak koi reel nahi banaya"
                : tab === "liked"
                  ? "Koi liked reel nahi"
                  : "Koi saved reel nahi"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {tabReels.map((reel) => (
              <motion.div
                key={reel.id}
                whileTap={{ scale: 0.97 }}
                className="aspect-[9/16] relative overflow-hidden cursor-pointer"
                style={{
                  background: reel.gradientVia
                    ? `linear-gradient(135deg, ${reel.gradientFrom}, ${reel.gradientVia}, ${reel.gradientTo})`
                    : `linear-gradient(135deg, ${reel.gradientFrom}, ${reel.gradientTo})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 text-white fill-white" />
                  <span className="text-[9px] text-white font-bold">
                    {formatCount(reel.views)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 text-center py-2">
      <p className="text-lg font-display font-black text-white">{value}</p>
      <p className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
        {label}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  ocid,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all duration-200 relative"
      style={{ color: active ? "white" : "oklch(0.40 0 0)" }}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="profile-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "var(--amo-gradient)" }}
        />
      )}
    </button>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("AMO Creator");
  const [bio, setBio] = useState("Creating magic on AMO! 🎬✨");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      <div
        className="flex items-center justify-between px-4 pt-12 pb-4"
        style={{ borderBottom: "1px solid oklch(0.15 0 0)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-white/60 text-sm"
        >
          Cancel
        </button>
        <h2 className="font-display font-bold text-white">Edit Profile</h2>
        <button
          type="button"
          data-ocid="profile.save_button"
          onClick={onClose}
          className="text-sm font-bold amo-gradient-text"
        >
          Save
        </button>
      </div>

      <div className="flex flex-col items-center pt-6 pb-4 gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
          style={{ background: "var(--amo-gradient)" }}
        >
          A
        </div>
        <button
          type="button"
          className="text-sm font-semibold amo-gradient-text"
        >
          Change Photo
        </button>
      </div>

      <div className="px-4 space-y-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          <div className="px-4 pt-3 pb-1">
            <label
              htmlFor="edit-name"
              className="text-xs font-bold"
              style={{ color: "oklch(0.45 0 0)" }}
            >
              NAME
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-white text-sm py-2 outline-none border-b"
              style={{ borderColor: "oklch(0.20 0 0)" }}
            />
          </div>
          <div className="px-4 pt-3 pb-3">
            <label
              htmlFor="edit-bio"
              className="text-xs font-bold"
              style={{ color: "oklch(0.45 0 0)" }}
            >
              BIO
            </label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-white text-sm py-2 outline-none resize-none mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
