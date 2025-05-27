import { useExpenses } from "@/hooks/expenses/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, handleLogout, isAuthenticated } = useAuth();
  const { expenses, isLoading, error, refetch } = useExpenses();

  if (!isAuthenticated) return null;

  const stats = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount || "0"),
      0
    ),
    avgAmount:
      expenses.length > 0
        ? expenses.reduce(
            (sum, expense) => sum + parseFloat(expense.amount || "0"),
            0
          ) / expenses.length
        : 0,
    thisMonth: expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.createdAt);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0),
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "blue",
  }: {
    title: string;
    value: string;
    icon: string;
    color?: string;
  }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 mx-1">
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons
          name={icon as any}
          size={24}
          color={
            color === "blue"
              ? "#3B82F6"
              : color === "green"
              ? "#10B981"
              : "#F59E0B"
          }
        />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-1">{value}</Text>
      <Text className="text-sm text-gray-600">{title}</Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">No user data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Profile</Text>
            <Text className="text-sm text-gray-600">Account & Statistics</Text>
          </View>
          <TouchableOpacity
            className="bg-red-500 px-4 py-2 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-800">
              {user.username}
            </Text>
            <Text className="text-sm text-gray-600">
              Member since {formatDate(user.createdAt)}
            </Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Account Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">User ID:</Text>
                <Text className="font-medium text-gray-800">#{user.id}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Email:</Text>
                <Text className="font-medium text-gray-800">
                  {user.username}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Expense Statistics
          </Text>

          {isLoading ? (
            <View className="bg-white p-8 rounded-2xl shadow-sm items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading statistics...</Text>
            </View>
          ) : error ? (
            <View className="bg-white p-8 rounded-2xl shadow-sm items-center">
              <Text className="text-red-600">Error: {error.message}</Text>
            </View>
          ) : (
            <>
              <View className="flex-row mb-4">
                <StatCard
                  title="Total Expenses"
                  value={stats.totalExpenses.toString()}
                  icon="receipt"
                  color="blue"
                />
                <StatCard
                  title="Total Amount"
                  value={formatCurrency(stats.totalAmount)}
                  icon="card"
                  color="green"
                />
              </View>

              <View className="flex-row mb-6">
                <StatCard
                  title="Average Amount"
                  value={formatCurrency(stats.avgAmount)}
                  icon="analytics"
                  color="orange"
                />
                <StatCard
                  title="This Month"
                  value={formatCurrency(stats.thisMonth)}
                  icon="calendar"
                  color="blue"
                />
              </View>

              <View className="bg-white p-6 rounded-2xl shadow-sm">
                <Text className="text-lg font-bold text-gray-800 mb-4">
                  Recent Activity
                </Text>
                {expenses.length > 0 ? (
                  <View className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <View
                        key={expense.id}
                        className="flex-row justify-between items-center py-2"
                      >
                        <View className="flex-1">
                          <Text className="font-medium text-gray-800">
                            {expense.name}
                          </Text>
                          <Text
                            className="text-sm text-gray-600"
                            numberOfLines={1}
                          >
                            {expense.description}
                          </Text>
                        </View>
                        <Text className="font-bold text-blue-600">
                          {formatCurrency(parseFloat(expense.amount))}
                        </Text>
                      </View>
                    ))}
                    {expenses.length > 5 && (
                      <TouchableOpacity
                        className="mt-3 py-2"
                        onPress={() => router.replace("/(tabs)")}
                      >
                        <Text className="text-blue-500 text-center font-medium">
                          View All Expenses
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Ionicons
                      name="receipt-outline"
                      size={48}
                      color="#D1D5DB"
                    />
                    <Text className="text-gray-500 mt-2">No expenses yet</Text>
                    <TouchableOpacity
                      className="bg-blue-500 px-4 py-2 rounded-lg mt-3"
                      onPress={() => router.replace("/(tabs)/create")}
                    >
                      <Text className="text-white font-medium">
                        Add First Expense
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        <View className="px-4 mt-6 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-xl flex-row items-center mb-3"
            onPress={() => router.replace("/(tabs)/create")}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-semibold text-lg ml-3">
              Add New Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 p-4 rounded-xl flex-row items-center mb-3"
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="list" size={24} color="white" />
            <Text className="text-white font-semibold text-lg ml-3">
              View All Expenses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-xl flex-row items-center"
            onPress={() => refetch()}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text className="text-white font-semibold text-lg ml-3">
              Refresh Statistics
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
