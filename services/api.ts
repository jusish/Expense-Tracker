import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { CreateExpenseData, Expense, User } from "../types";

const API_BASE_URL = "https://67ac71475853dfff53dab929.mockapi.io/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: any, context: string): Error => {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return new Error(
        "Request timeout. Please check your internet connection."
      );
    }
    if (error.response?.status === 404) {
      return new Error(`${context} not found`);
    }
    if (error.response?.status === 400) {
      return new Error(`Invalid data provided for ${context}`);
    }
    if (error.response && error.response.status >= 500) {
      return new Error("Server error. Please try again later.");
    }
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
  }
  return error instanceof Error ? error : new Error(`Failed to ${context}`);
};

// 1. Login User
export const useLoginUser = () => {
  return useMutation<User, Error, { username: string; password: string }>({
    mutationFn: async ({ username, password }) => {
      try {
        const response = await api.get<User[]>("/users", {
          params: { username },
        });
        console.log("LoginUser: response.data", response.data);

        if (!response.data || response.data.length === 0) {
          throw new Error("User not found");
        }

        const user = response.data.find(
          (u) => u.username === username && u.password === password
        );
        console.log("LoginUser: matched user", user);

        if (!user) {
          throw new Error("Invalid username or password");
        }

        return user;
      } catch (error) {
        throw handleApiError(error, "login");
      }
    },
  });
};

// 2. Create Expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseData>({
    mutationFn: async (expenseData) => {
      try {
        // Validate data before sending
        if (!expenseData.name?.trim()) {
          throw new Error("Expense name is required");
        }

        const amount = parseFloat(expenseData.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Amount must be a valid positive number");
        }

        const payload = {
          name: expenseData.name.trim(),
          amount: amount.toString(), // Ensure it's a string for consistency
          description: expenseData.description?.trim() || "",
          createdAt: new Date().toISOString(), // Add timestamp if not provided by API
        };

        const response = await api.post<Expense>("/expenses", payload);

        if (!response.data) {
          throw new Error("Failed to create expense - no data returned");
        }

        return response.data;
      } catch (error) {
        throw handleApiError(error, "create expense");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// 3. Get Expense by ID - Fixed to handle the ID properly
export const useGetExpenseById = (expenseId: string) => {
  return useQuery<Expense, Error>({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      try {
        if (!expenseId) {
          throw new Error("Expense ID is required");
        }

        const response = await api.get<Expense>(`/expenses/${expenseId}`);

        if (!response.data) {
          throw new Error("Expense not found");
        }

        // Ensure amount is properly formatted
        const expense = response.data;
        if (expense.amount) {
          expense.amount = parseFloat(expense.amount).toString();
        }

        return expense;
      } catch (error) {
        throw handleApiError(error, "fetch expense");
      }
    },
    enabled: !!expenseId && expenseId !== "",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// 4. Get All Expenses - Improved with better error handling and data validation
export const useGetAllExpenses = () => {
  return useQuery<Expense[], Error>({
    queryKey: ["expenses"],
    queryFn: async () => {
      try {
        const response = await api.get<Expense[]>("/expenses");

        if (!response.data) {
          return [];
        }

        // Validate and clean up the data
        const cleanedExpenses = response.data
          .filter((expense) => expense && expense.id) // Filter out invalid entries
          .map((expense) => ({
            ...expense,
            name: expense.name || "Unnamed Expense",
            description: expense.description || "",
            amount: expense.amount
              ? parseFloat(expense.amount).toString()
              : "0",
            createdAt: expense.createdAt || new Date().toISOString(),
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        return cleanedExpenses;
      } catch (error) {
        throw handleApiError(error, "fetch expenses");
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// 5. Delete Expense - Improved with better error handling
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (expenseId) => {
      try {
        if (!expenseId) {
          throw new Error("Expense ID is required for deletion");
        }

        await api.delete(`/expenses/${expenseId}`);
      } catch (error) {
        throw handleApiError(error, "delete expense");
      }
    },
    onSuccess: (_, expenseId) => {
      // Remove the deleted expense from cache immediately for better UX
      queryClient.setQueryData<Expense[]>(["expenses"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((expense) => expense.id !== expenseId);
      });

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      // Remove the specific expense from cache
      queryClient.removeQueries({ queryKey: ["expense", expenseId] });
    },
    onError: (error) => {
    },
  });
};

// 6. Update Expense - New functionality
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Expense,
    Error,
    { id: string; data: Partial<CreateExpenseData> }
  >({
    mutationFn: async ({ id, data }) => {
      try {
        if (!id) {
          throw new Error("Expense ID is required for update");
        }

        // Validate data if amount is being updated
        if (data.amount !== undefined) {
          const amount = parseFloat(data.amount);
          if (isNaN(amount) || amount <= 0) {
            throw new Error("Amount must be a valid positive number");
          }
        }

        const payload = {
          ...(data.name && { name: data.name.trim() }),
          ...(data.amount && { amount: parseFloat(data.amount).toString() }),
          ...(data.description !== undefined && {
            description: data.description.trim(),
          }),
        };

        const response = await api.put<Expense>(`/expenses/${id}`, payload);

        if (!response.data) {
          throw new Error("Failed to update expense - no data returned");
        }

        return response.data;
      } catch (error) {
        throw handleApiError(error, "update expense");
      }
    },
    onSuccess: (updatedExpense) => {
      // Update the expense in the list cache
      queryClient.setQueryData<Expense[]>(["expenses"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((expense) =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
      });

      // Update the individual expense cache
      queryClient.setQueryData(["expense", updatedExpense.id], updatedExpense);

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// 7. Get Expenses Statistics - New functionality
export const useGetExpensesStats = () => {
  return useQuery({
    queryKey: ["expenses-stats"],
    queryFn: async () => {
      try {
        const response = await api.get<Expense[]>("/expenses");

        if (!response.data || response.data.length === 0) {
          return {
            total: 0,
            count: 0,
            average: 0,
            thisMonth: 0,
            lastMonth: 0,
          };
        }

        const expenses = response.data;
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const total = expenses.reduce((sum, expense) => {
          const amount = parseFloat(expense.amount || "0");
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const thisMonthExpenses = expenses.filter(
          (expense) => new Date(expense.createdAt) >= thisMonth
        );
        const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => {
          const amount = parseFloat(expense.amount || "0");
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const lastMonthExpenses = expenses.filter((expense) => {
          const date = new Date(expense.createdAt);
          return date >= lastMonth && date <= lastMonthEnd;
        });
        const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => {
          const amount = parseFloat(expense.amount || "0");
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        return {
          total: parseFloat(total.toFixed(2)),
          count: expenses.length,
          average: parseFloat((total / expenses.length).toFixed(2)),
          thisMonth: parseFloat(thisMonthTotal.toFixed(2)),
          lastMonth: parseFloat(lastMonthTotal.toFixed(2)),
        };
      } catch (error) {
        throw handleApiError(error, "fetch expenses statistics");
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
