import { useAuth } from "@/hooks/useAuth";
import { useCreateExpense } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateExpenseScreen() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmountChange = (value: string) => {
    // Optionally add validation here
    updateFormData("amount", value);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      description: "",
    });
  };

  const validateForm = () => {
    return (
      formData.name.trim().length > 0 &&
      formData.amount.trim().length > 0 &&
      !isNaN(Number(formData.amount)) &&
      formData.description.trim().length > 0
    );
  };

  const createExpenseMutation = useCreateExpense();

  const createExpense = async (data: typeof formData) => {
    await createExpenseMutation.mutateAsync(data);
  };

  if (!isAuthenticated) return null;

  const handleCreateExpense = async () => {
    if (!validateForm()) return;

    try {
      await createExpense(formData);
      Alert.alert("Success", "Expense created successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.replace("/expenses");
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create expense";
      Alert.alert("Error", errorMessage);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Add Expense
              </Text>
              <Text className="text-sm text-gray-600">Track your spending</Text>
            </View>
            <TouchableOpacity
              className="p-2"
              onPress={resetForm}
              disabled={createExpenseMutation.isPending}
            >
              <Ionicons name="refresh" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white p-6 rounded-2xl shadow-sm">
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Expense Name *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-blue-500"
                placeholder="e.g., Lunch, Gas, Coffee"
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
                maxLength={50}
                editable={!createExpenseMutation.isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                {formData.name.length}/50 characters
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Amount *
              </Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-gray-700 mr-2">$</Text>
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-blue-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  maxLength={10}
                  editable={!createExpenseMutation.isPending}
                />
              </View>
              {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                <Text className="text-xs text-blue-600 mt-1">
                  Amount: ${parseFloat(formData.amount).toFixed(2)}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Description *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-blue-500"
                placeholder="Brief description of the expense"
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
                editable={!createExpenseMutation.isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </Text>
            </View>

            {(formData.name || formData.amount || formData.description) && (
              <View className="bg-blue-50 p-4 rounded-xl mb-6">
                <Text className="text-sm font-semibold text-blue-800 mb-2">
                  Preview
                </Text>
                <Text className="text-blue-700">
                  <Text className="font-semibold">Name:</Text>{" "}
                  {formData.name || "Not set"}
                </Text>
                <Text className="text-blue-700">
                  <Text className="font-semibold">Amount:</Text> $
                  {formData.amount || "0.00"}
                </Text>
                <Text className="text-blue-700">
                  <Text className="font-semibold">Description:</Text>{" "}
                  {formData.description || "Not set"}
                </Text>
              </View>
            )}

            <View className="space-y-3">
              <TouchableOpacity
                className={`py-3 rounded-full mb-3 ${
                  createExpenseMutation.isPending
                    ? "bg-gray-400"
                    : "bg-blue-500"
                }`}
                onPress={handleCreateExpense}
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      Creating...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      Create Expense
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 rounded-full border border-gray-300 bg-white"
                onPress={() => router.replace("/expenses")}
                disabled={createExpenseMutation.isPending}
              >
                <Text className="text-gray-700 text-center font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
