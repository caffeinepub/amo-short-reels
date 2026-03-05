import { Input } from "@/components/ui/input";
import { Heart, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface CommentsDrawerProps {
  reelId: number | null;
  onClose: () => void;
}

const MOCK_COMMENTS = [
  {
    id: 1,
    user: "priya_creates",
    avatar: "PS",
    text: "Yaar ekdum mast! Kya views hain 🔥🔥",
    time: "2m",
    likes: 234,
  },
  {
    id: 2,
    user: "arjun.dance",
    avatar: "AK",
    text: "Bhai tu toh viral ho jayega iss baar! ❤️",
    time: "5m",
    likes: 89,
  },
  {
    id: 3,
    user: "sneha_foodie",
    avatar: "SP",
    text: "Waah waah!! Sach mein bahut achha bana hai 💯",
    time: "12m",
    likes: 456,
  },
  {
    id: 4,
    user: "rahul.comedy",
    avatar: "RD",
    text: "Hahahaha ekdum sahi pakda bhai 😂😂😂",
    time: "23m",
    likes: 1203,
  },
  {
    id: 5,
    user: "meera.classical",
    avatar: "MK",
    text: "Ye step sikhao please! Tutorial chahiye 🙏",
    time: "45m",
    likes: 67,
  },
  {
    id: 6,
    user: "kabir_tech",
    avatar: "KM",
    text: "Next level creativity! Keep going 💪",
    time: "1h",
    likes: 345,
  },
];

export default function CommentsDrawer({
  reelId,
  onClose,
}: CommentsDrawerProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  const handleSubmit = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: comments.length + 1,
      user: "you",
      avatar: "ME",
      text: comment.trim(),
      time: "now",
      likes: 0,
    };
    setComments((prev) => [newComment, ...prev]);
    setComment("");
  };

  const handleLikeComment = (id: number) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {reelId !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-3xl overflow-hidden"
            style={{ background: "oklch(0.12 0 0)", height: "75vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "oklch(0.30 0 0)" }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 pb-3"
              style={{ borderBottom: "1px solid oklch(0.18 0 0)" }}
            >
              <h3 className="text-white font-bold text-base">
                {comments.length} Comments
              </h3>
              <button
                type="button"
                data-ocid="comments.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.20 0 0)" }}
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Comments list */}
            <div
              className="overflow-y-auto scrollbar-hide"
              style={{ height: "calc(75vh - 130px)" }}
            >
              <div className="px-4 py-3 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--amo-gradient)" }}
                    >
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white/70 mr-2">
                            @{c.user}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "oklch(0.40 0 0)" }}
                          >
                            {c.time}
                          </span>
                          <p className="text-sm text-white mt-0.5 leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLikeComment(c.id)}
                          className="flex flex-col items-center gap-0.5 flex-shrink-0 ml-2"
                        >
                          <Heart
                            className="w-4 h-4 transition-colors"
                            style={{
                              color: likedComments.has(c.id)
                                ? "oklch(0.72 0.28 335)"
                                : "oklch(0.45 0 0)",
                              fill: likedComments.has(c.id)
                                ? "oklch(0.72 0.28 335)"
                                : "transparent",
                            }}
                          />
                          <span
                            className="text-[10px]"
                            style={{ color: "oklch(0.45 0 0)" }}
                          >
                            {likedComments.has(c.id) ? c.likes + 1 : c.likes}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment input */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 safe-bottom"
              style={{
                background: "oklch(0.10 0 0)",
                borderTop: "1px solid oklch(0.18 0 0)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--amo-gradient)" }}
              >
                ME
              </div>
              <div className="flex-1 relative">
                <Input
                  data-ocid="comments.input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Add a comment..."
                  className="pr-10 rounded-full border-0 text-sm text-white placeholder:text-white/30"
                  style={{ background: "oklch(0.18 0 0)", height: "40px" }}
                />
                {comment.trim() && (
                  <button
                    type="button"
                    data-ocid="comments.submit_button"
                    onClick={handleSubmit}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Send className="w-4 h-4 amo-gradient-text" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
