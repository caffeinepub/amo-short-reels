import { Input } from "@/components/ui/input";
import { MOCK_HASHTAGS, MOCK_REELS } from "@/data/mockReels";
import { Play, Search, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function DiscoverScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const filtered = searchTerm
    ? MOCK_REELS.filter(
        (r) =>
          r.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.hashtags.some((h) =>
            h.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          r.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : selectedHashtag
      ? MOCK_REELS.filter((r) =>
          r.hashtags.some(
            (h) => h.toLowerCase() === selectedHashtag.toLowerCase(),
          ),
        )
      : MOCK_REELS;

  return (
    <div
      className="h-full overflow-y-auto scrollbar-hide pb-20"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-12 pb-3"
        style={{
          background: "oklch(0.07 0 0 / 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1 className="text-2xl font-display font-black amo-gradient-text mb-3">
          Discover
        </h1>

        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "oklch(0.45 0 0)" }}
          />
          <Input
            data-ocid="discover.search_input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedHashtag(null);
            }}
            placeholder="Search reels, creators, hashtags..."
            className="pl-10 h-11 rounded-2xl text-sm text-white placeholder:text-white/30 border-0"
            style={{ background: "oklch(0.13 0 0)" }}
          />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-4">
        {/* Trending hashtags — shown when no search */}
        {!searchTerm && !selectedHashtag && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 amo-gradient-text" />
              <h2 className="text-sm font-bold text-white">
                Trending Hashtags
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_HASHTAGS.map((ht, i) => (
                <motion.button
                  key={ht.tag}
                  data-ocid={`discover.hashtag.item.${i + 1}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedHashtag(ht.tag)}
                  className="rounded-2xl p-3 text-left overflow-hidden relative"
                  style={{
                    background: `linear-gradient(135deg, ${ht.color[0]}, ${ht.color[1]})`,
                    minHeight: "80px",
                  }}
                >
                  <div className="absolute top-2 right-2 opacity-20">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm leading-tight">
                    {ht.tag}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {ht.count} videos
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Active hashtag filter */}
        {selectedHashtag && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full amo-border-gradient">
              <span className="text-sm font-bold amo-gradient-text">
                {selectedHashtag}
              </span>
              <button
                type="button"
                onClick={() => setSelectedHashtag(null)}
                className="text-white/40 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Reels grid */}
        <section>
          {(searchTerm || selectedHashtag) && (
            <p className="text-xs mb-3" style={{ color: "oklch(0.45 0 0)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
          {!searchTerm && !selectedHashtag && (
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 amo-gradient-text" />
              <h2 className="text-sm font-bold text-white">Trending Reels</h2>
            </div>
          )}

          {filtered.length === 0 ? (
            <div
              data-ocid="discover.empty_state"
              className="flex flex-col items-center gap-3 py-12"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.13 0 0)" }}
              >
                <Search
                  className="w-7 h-7"
                  style={{ color: "oklch(0.35 0 0)" }}
                />
              </div>
              <p className="text-white/40 text-sm text-center">
                Koi result nahi mila.
                <br />
                Kuch aur search karo!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {filtered.map((reel) => (
                <motion.div
                  key={reel.id}
                  whileTap={{ scale: 0.97 }}
                  className="aspect-[9/16] rounded-xl overflow-hidden relative cursor-pointer"
                  style={{
                    background: reel.gradientVia
                      ? `linear-gradient(135deg, ${reel.gradientFrom}, ${reel.gradientVia}, ${reel.gradientTo})`
                      : `linear-gradient(135deg, ${reel.gradientFrom}, ${reel.gradientTo})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 text-white fill-white" />
                      <span className="text-white text-[9px] font-bold">
                        {formatViews(reel.views)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}
