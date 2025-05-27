import { useGetAllExpenses } from "@/services/api";
import { useMemo, useState } from "react";

export const useExpenses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useGetAllExpenses();

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        expense.name?.toLowerCase().includes(searchLower) ||
        expense.description?.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "amount":
          aValue = parseFloat(a.amount || "0");
          bValue = parseFloat(b.amount || "0");
          break;
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "date":
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [expenses, searchQuery, sortBy, sortOrder]);

  const calculateTotal = (): string => {
    const total = filteredAndSortedExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount || "0");
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return total.toFixed(2);
  };

  const toggleSort = (field: "date" | "amount" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "swap-vertical";
    return sortOrder === "asc" ? "arrow-up" : "arrow-down";
  };

  return {
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
  };
};