import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/store/authStore";
import { View, ActivityIndicator } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isReady, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    SplashScreen.preventAutoHideAsync();
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#3B82F6",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
}
