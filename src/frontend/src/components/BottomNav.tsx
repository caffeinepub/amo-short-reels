import { Bell, Home, Search, User, Video } from "lucide-react";
import { motion } from "motion/react";

type Screen = "home" | "discover" | "create" | "notifications" | "profile";

interface BottomNavProps {
  current: Screen;
  onChange: (screen: Screen) => void;
}

export default function BottomNav({ current, onChange }: BottomNavProps) {
  const navItems = [
    {
      id: "home" as Screen,
      icon: Home,
      label: "Home",
      ocid: "nav.home_button",
    },
    {
      id: "discover" as Screen,
      icon: Search,
      label: "Discover",
      ocid: "nav.discover_button",
    },
    {
      id: "notifications" as Screen,
      icon: Bell,
      label: "Alerts",
      ocid: "nav.notifications_button",
    },
    {
      id: "profile" as Screen,
      icon: User,
      label: "Profile",
      ocid: "nav.profile_button",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 safe-bottom"
      style={{
        background: "oklch(0.08 0 0 / 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid oklch(0.20 0 0)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.slice(0, 2).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={current === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}

        {/* Create/Camera center button */}
        <motion.button
          type="button"
          data-ocid="nav.create_button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange("create")}
          className="relative -mt-5 flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-glow"
          style={{ background: "var(--amo-gradient)" }}
        >
          <Video className="w-6 h-6" />
        </motion.button>

        {navItems.slice(2).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={current === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: { id: string; icon: React.ElementType; label: string; ocid: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      data-ocid={item.ocid}
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-4 py-1 min-w-[52px]"
    >
      <div className="relative">
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 rounded-full blur-sm"
            style={{ background: "var(--amo-gradient)" }}
          />
        )}
        <Icon
          className="relative w-6 h-6 transition-all duration-200"
          style={{
            color: isActive ? "oklch(0.72 0.28 335)" : "oklch(0.45 0 0)",
            fill: isActive ? "oklch(0.72 0.28 335)" : "transparent",
            strokeWidth: isActive ? 2.5 : 2,
          }}
        />
      </div>
      <span
        className="text-[10px] font-medium transition-colors"
        style={{ color: isActive ? "oklch(0.72 0.28 335)" : "oklch(0.40 0 0)" }}
      >
        {item.label}
      </span>
    </motion.button>
  );
}
