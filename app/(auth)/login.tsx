import { useLogin } from "@/hooks/useLogin";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { formData, updateFormData, handleLogin, isLoading } = useLogin();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-blue-600 mb-2">
              Expense Tracker
            </Text>
            <Text className="text-lg text-gray-600">
              Manage your expenses easily
            </Text>
          </View>

          <View className="bg-white p-6 rounded-2xl shadow-lg">
            <Text className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              Welcome Back
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-blue-500"
                placeholder="Enter your email"
                value={formData.username}
                onChangeText={(text) => updateFormData("username", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                secureTextEntry
                autoComplete="password"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`py-4 rounded-xl ${
                isLoading ? "bg-gray-400" : "bg-blue-500"
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
