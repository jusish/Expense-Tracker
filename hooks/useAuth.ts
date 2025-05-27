import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, isReady } = useAuthStore();

  useEffect(() => {
    // Only redirect if Zustand is hydrated and navigation context is ready
    if (isReady && !isAuthenticated) {
      // setTimeout ensures navigation happens after context is ready
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 0);
    }
  }, [isReady, isAuthenticated, router]);

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return {
    user,
    isAuthenticated,
    isReady,
    handleLogout,
  };
};
