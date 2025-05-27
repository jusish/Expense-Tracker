import { useExpenses } from "@/hooks/expenses/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteExpense } from "@/services/api";
import { Expense } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExpensesListScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const deleteMutation = useDeleteExpense();

  const {
    expenses,
    filteredAndSortedExpenses,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    toggleSort,
    getSortIcon,
    calculateTotal,
  } = useExpenses();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  if (!isAuthenticated) return null;

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(num) || num === null || num === undefined
      ? "$0.00"
      : `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return "No date given";
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDetailedDate = (dateString: string): string => {
    try {
      if (!dateString) return "No date";
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const confirmDelete = (expenseId: string, expenseName: string) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete "${expenseName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(expenseId);
              setShowExpenseModal(false);
              Alert.alert("Success", "Expense deleted successfully!");
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Failed to delete expense";
              Alert.alert("Error", errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-50"
      onPress={() => handleViewExpense(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {item.name || "Unnamed Expense"}
          </Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.description || "No description"}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-bold text-blue-600">
            {formatCurrency(item.amount)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ExpenseDetailsModal = () => (
    <Modal
      visible={showExpenseModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Expense Details</Text>
          <TouchableOpacity
            onPress={() =>
              selectedExpense &&
              confirmDelete(
                selectedExpense.id,
                selectedExpense.name || "Unknown"
              )
            }
            className="bg-red-100 px-3 py-1 rounded-full"
          >
            <Ionicons name="trash" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {selectedExpense && (
          <ScrollView className="flex-1">
            <View className="p-6">
              {/* Amount Card */}
              <View className="bg-white p-6 rounded-xl mb-4 items-center border border-gray-100">
                <Text className="text-sm text-gray-600 mb-2">Amount</Text>
                <Text className="text-4xl font-bold text-blue-600">
                  {formatCurrency(selectedExpense.amount)}
                </Text>
              </View>

              {/* Details Card */}
              <View className="bg-white p-6 rounded-xl mb-4 border border-gray-100">
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Name
                  </Text>
                  <Text className="text-lg text-gray-800">
                    {selectedExpense.name || "Unnamed Expense"}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Description
                  </Text>
                  <Text className="text-base text-gray-800">
                    {selectedExpense.description || "No description provided"}
                  </Text>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Created Date
                  </Text>
                  <Text className="text-base text-gray-800">
                    {formatDetailedDate(selectedExpense.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Sort & Filter</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="p-6">
          <Text className="text-lg font-semibold mb-4">Sort By</Text>

          <TouchableOpacity
            className="flex-row items-center justify-between py-4 border-b border-gray-200"
            onPress={() => toggleSort("date")}
          >
            <Text className="text-base">Date Created</Text>
            <Ionicons
              name={getSortIcon("date")}
              size={20}
              color={sortBy === "date" ? "#3B82F6" : "#9CA3AF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-4 border-b border-gray-200"
            onPress={() => toggleSort("amount")}
          >
            <Text className="text-base">Amount</Text>
            <Ionicons
              name={getSortIcon("amount")}
              size={20}
              color={sortBy === "amount" ? "#3B82F6" : "#9CA3AF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-4 border-b border-gray-200"
            onPress={() => toggleSort("name")}
          >
            <Text className="text-base">Name</Text>
            <Ionicons
              name={getSortIcon("name")}
              size={20}
              color={sortBy === "name" ? "#3B82F6" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Ionicons
        name={searchQuery ? "search" : "receipt-outline"}
        size={80}
        color="#D1D5DB"
      />
      <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
        {searchQuery ? "No Matching Expenses" : "No Expenses Yet"}
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        {searchQuery
          ? "Try adjusting your search terms"
          : "Start tracking your expenses by adding your first one"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => router.navigate("/create")}
        >
          <Text className="text-white font-semibold">Add First Expense</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && !deleteMutation.isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">
            Loading expenses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={80} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {error.message}
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-xl"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-100">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Expenses</Text>
            <Text className="text-sm text-gray-600">
              {filteredAndSortedExpenses.length} of {expenses.length} expense
              {expenses.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-gray-600">Total</Text>
            <Text className="text-xl font-bold text-green-600">
              ${calculateTotal()}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-blue-50 rounded-full px-4 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-2"
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="funnel" size={16} color="#3B82F6" />
          <Text className="text-blue-500 font-medium ml-2">
            Sort by {sortBy} ({sortOrder})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="px-4 py-4">
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
          onPress={() => router.navigate("/create")}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Add New Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredAndSortedExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={deleteMutation.isPending}
              onRefresh={refetch}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <ExpenseDetailsModal />
      <FiltersModal />
    </SafeAreaView>
  );
}
