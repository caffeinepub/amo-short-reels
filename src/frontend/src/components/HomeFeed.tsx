import { MOCK_REELS, type MockReel } from "@/data/mockReels";
import {
  Bookmark,
  CheckCircle2,
  Heart,
  MessageCircle,
  Music2,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

interface HomeFeedProps {
  onOpenComments: (reelId: number) => void;
}

export default function HomeFeed({ onOpenComments }: HomeFeedProps) {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [reels, setReels] = useState<MockReel[]>(MOCK_REELS);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLike = useCallback((id: number) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isLiked: !r.isLiked,
              likes: r.isLiked ? r.likes - 1 : r.likes + 1,
            }
          : r,
      ),
    );
  }, []);

  const handleBookmark = useCallback((id: number) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r,
      ),
    );
  }, []);

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden"
      style={{ background: "oklch(0.05 0 0)" }}
    >
      {/* Top Header */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.05 0 0 / 0.95) 0%, transparent 100%)",
        }}
      >
        <img
          src="/assets/generated/amo-logo-transparent.dim_400x200.png"
          alt="AMO"
          className="h-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const next = e.currentTarget.nextElementSibling as HTMLElement;
            if (next) next.style.display = "block";
          }}
        />
        <span className="hidden text-3xl font-display font-black amo-gradient-text">
          AMO
        </span>

        {/* For You / Following tabs */}
        <div className="flex items-center gap-1 bg-black/30 rounded-full p-0.5 backdrop-blur-sm">
          <button
            type="button"
            data-ocid="feed.for_you_tab"
            onClick={() => setActiveTab("forYou")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === "forYou" ? "text-white" : "text-white/50"
            }`}
            style={
              activeTab === "forYou"
                ? { background: "var(--amo-gradient)" }
                : {}
            }
          >
            For You
          </button>
          <button
            type="button"
            data-ocid="feed.following_tab"
            onClick={() => setActiveTab("following")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === "following" ? "text-white" : "text-white/50"
            }`}
            style={
              activeTab === "following"
                ? { background: "var(--amo-gradient)" }
                : {}
            }
          >
            Following
          </button>
        </div>
      </div>

      {/* Reels Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {reels.map((reel, index) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            index={index}
            onLike={() => handleLike(reel.id)}
            onComment={() => onOpenComments(reel.id)}
            onBookmark={() => handleBookmark(reel.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelCard({
  reel,
  index,
  onLike,
  onComment,
  onBookmark,
}: {
  reel: MockReel;
  index: number;
  onLike: () => void;
  onComment: () => void;
  onBookmark: () => void;
}) {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const lastTap = useRef(0);
  const heartId = useRef(0);

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        let x: number;
        let y: number;
        if ("touches" in e && e.touches.length > 0) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
        } else if ("clientX" in e) {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        } else {
          x = rect.width / 2;
          y = rect.height / 2;
        }
        const id = ++heartId.current;
        setHearts((prev) => [...prev, { id, x, y }]);
        if (!reel.isLiked) onLike();
        setTimeout(
          () => setHearts((prev) => prev.filter((h) => h.id !== id)),
          800,
        );
      }
      lastTap.current = now;
    },
    [reel.isLiked, onLike],
  );

  return (
    <div
      data-ocid={`feed.reel.item.${index + 1}`}
      className="relative w-full flex-shrink-0"
      style={{ height: "calc(100vh - 70px)", scrollSnapAlign: "start" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: reel.gradientVia
            ? `linear-gradient(160deg, ${reel.gradientFrom}, ${reel.gradientVia}, ${reel.gradientTo})`
            : `linear-gradient(160deg, ${reel.gradientFrom}, ${reel.gradientTo})`,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

      {/* Double tap area */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Double-tap gesture only on video feed */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleDoubleTap}
        onTouchEnd={handleDoubleTap}
      />

      {/* Heart burst animations */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute z-20 pointer-events-none text-5xl animate-heart-burst"
          style={{ left: heart.x - 24, top: heart.y - 24 }}
        >
          ❤️
        </div>
      ))}

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <motion.button
          data-ocid={`feed.like_button.${index + 1}`}
          whileTap={{ scale: 1.3 }}
          onClick={onLike}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.10 0 0 / 0.5)" }}
          >
            <Heart
              className="w-6 h-6 transition-all duration-200"
              style={{
                color: reel.isLiked ? "oklch(0.72 0.28 335)" : "white",
                fill: reel.isLiked ? "oklch(0.72 0.28 335)" : "transparent",
              }}
            />
          </div>
          <span className="text-xs font-bold text-white text-shadow-sm">
            {formatCount(reel.likes)}
          </span>
        </motion.button>

        {/* Comment */}
        <motion.button
          data-ocid={`feed.comment_button.${index + 1}`}
          whileTap={{ scale: 1.2 }}
          onClick={onComment}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.10 0 0 / 0.5)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white text-shadow-sm">
            {formatCount(reel.comments)}
          </span>
        </motion.button>

        {/* Share */}
        <motion.button
          data-ocid={`feed.share_button.${index + 1}`}
          whileTap={{ scale: 1.2 }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.10 0 0 / 0.5)" }}
          >
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white text-shadow-sm">
            {formatCount(reel.shares)}
          </span>
        </motion.button>

        {/* Bookmark */}
        <motion.button
          data-ocid={`feed.bookmark_button.${index + 1}`}
          whileTap={{ scale: 1.2 }}
          onClick={onBookmark}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.10 0 0 / 0.5)" }}
          >
            <Bookmark
              className="w-6 h-6 transition-all duration-200"
              style={{
                color: reel.isBookmarked ? "oklch(0.78 0.22 30)" : "white",
                fill: reel.isBookmarked ? "oklch(0.78 0.22 30)" : "transparent",
              }}
            />
          </div>
        </motion.button>

        {/* Vinyl rotating disk */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 animate-vinyl"
          style={{ background: "var(--amo-gradient)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-0 right-16 z-20 px-4">
        {/* Creator info */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "var(--amo-gradient)" }}
          >
            {reel.avatar}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-sm text-shadow-sm">
              @{reel.username}
            </span>
            {reel.verified && (
              <CheckCircle2
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.28 335)" }}
              />
            )}
          </div>
          <button
            type="button"
            className="ml-2 px-3 py-0.5 rounded-full text-xs font-bold text-white border border-white/50 hover:bg-white/10 transition-colors"
          >
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className="text-white text-sm leading-relaxed text-shadow-sm mb-1 line-clamp-2">
          {reel.caption}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {reel.hashtags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs font-semibold amo-gradient-text">
              {tag}
            </span>
          ))}
        </div>

        {/* Music bar */}
        <div className="flex items-center gap-2">
          <Music2 className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap gap-16">
              <span className="text-xs text-white/80">
                {reel.musicName} — {reel.musicArtist}
              </span>
              <span className="text-xs text-white/80">
                {reel.musicName} — {reel.musicArtist}
              </span>
            </div>
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
