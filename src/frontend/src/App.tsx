import AuthScreen from "@/components/AuthScreen";
import BottomNav from "@/components/BottomNav";
import CameraScreen from "@/components/CameraScreen";
import CommentsDrawer from "@/components/CommentsDrawer";
import DiscoverScreen from "@/components/DiscoverScreen";
import HomeFeed from "@/components/HomeFeed";
import NotificationsScreen from "@/components/NotificationsScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useState } from "react";

type Screen = "home" | "discover" | "create" | "notifications" | "profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [openComments, setOpenComments] = useState<number | null>(null);
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.07 0 0)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center amo-gradient shadow-glow-lg">
            <span className="text-white font-display font-black text-2xl">
              A
            </span>
          </div>
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return <AuthScreen />;
  }

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div
      className="min-h-screen flex items-stretch justify-center"
      style={{ background: "oklch(0.04 0 0)" }}
    >
      {/* Mobile container */}
      <div
        className="relative w-full max-w-[430px] min-h-screen flex flex-col overflow-hidden"
        style={{ background: "oklch(0.07 0 0)" }}
      >
        {/* Camera modal - overlays everything */}
        {currentScreen === "create" && (
          <CameraScreen
            onClose={() => setCurrentScreen("home")}
            onNavigate={handleNavigate}
          />
        )}

        {/* Main content screens */}
        <main className="flex-1 relative overflow-hidden">
          {currentScreen === "home" && (
            <HomeFeed onOpenComments={(id) => setOpenComments(id)} />
          )}
          {currentScreen === "discover" && <DiscoverScreen />}
          {currentScreen === "notifications" && <NotificationsScreen />}
          {currentScreen === "profile" && <ProfileScreen />}
        </main>

        {/* Bottom navigation (hidden during camera) */}
        {currentScreen !== "create" && (
          <BottomNav current={currentScreen} onChange={handleNavigate} />
        )}

        {/* Comments drawer */}
        <CommentsDrawer
          reelId={openComments}
          onClose={() => setOpenComments(null)}
        />
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" />
    </div>
  );
}
