import { useLoginUser } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { LoginFormData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useLogin = () => {
  const { setUser } = useAuthStore();
  const loginMutation = useLoginUser();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }

    if (!validateEmail(formData.username)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert("Validation Error", "Please enter your password");
      return false;
    }

    if (formData.password.length < 3) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 3 characters long"
      );
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const user = await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
      });
      console.log("Login: user from backend:", user);

      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
      return true;
    } catch (error) {
      console.log("Login: error", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      Alert.alert("Login Failed", errorMessage);
      return false;
    }
  };

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateFormData,
    handleLogin,
    isLoading: loginMutation.isPending,
  };
};
