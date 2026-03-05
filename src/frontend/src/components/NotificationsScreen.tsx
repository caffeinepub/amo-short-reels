import { MOCK_NOTIFICATIONS } from "@/data/mockReels";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function NotificationsScreen() {
  return (
    <div
      className="h-full overflow-y-auto scrollbar-hide pb-20"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-12 pb-4"
        style={{
          background: "oklch(0.07 0 0 / 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1 className="text-2xl font-display font-black amo-gradient-text">
          Notifications
        </h1>
      </div>

      <div className="px-4 space-y-1">
        {/* Today section */}
        <p
          className="text-xs font-bold mb-3 px-1"
          style={{ color: "oklch(0.45 0 0)" }}
        >
          TODAY
        </p>
        {MOCK_NOTIFICATIONS.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/3 transition-colors cursor-pointer"
            style={{
              background:
                i === 0 || i === 2 ? "oklch(0.11 0 0)" : "transparent",
            }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--amo-gradient)" }}
              >
                {notif.avatar}
              </div>
              {/* Type icon badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background:
                    notif.type === "like"
                      ? "oklch(0.72 0.28 335)"
                      : notif.type === "follow"
                        ? "oklch(0.65 0.28 290)"
                        : "oklch(0.78 0.22 30)",
                }}
              >
                {notif.type === "like" && (
                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
                )}
                {notif.type === "follow" && (
                  <UserPlus className="w-2.5 h-2.5 text-white" />
                )}
                {notif.type === "comment" && (
                  <MessageCircle className="w-2.5 h-2.5 text-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-snug">
                <span className="font-bold">@{notif.user}</span>{" "}
                <span style={{ color: "oklch(0.70 0 0)" }}>
                  {notif.message}
                </span>
              </p>
              {notif.reel && (
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "oklch(0.45 0 0)" }}
                >
                  "{notif.reel}"
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0 0)" }}>
                {notif.time} ago
              </p>
            </div>

            {/* Follow back for follow notifs */}
            {notif.type === "follow" && (
              <button
                type="button"
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "var(--amo-gradient)" }}
              >
                Follow
              </button>
            )}
          </motion.div>
        ))}

        {/* Earlier section */}
        <p
          className="text-xs font-bold mb-3 mt-5 px-1"
          style={{ color: "oklch(0.45 0 0)" }}
        >
          EARLIER
        </p>
        <div className="flex flex-col items-center gap-3 py-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.12 0 0)" }}
          >
            <Bell className="w-6 h-6" style={{ color: "oklch(0.30 0 0)" }} />
          </div>
          <p
            className="text-sm text-center"
            style={{ color: "oklch(0.40 0 0)" }}
          >
            Purani notifications nahi hain
          </p>
        </div>
      </div>
    </div>
  );
}
