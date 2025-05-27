import { useCreateExpense as useCreateExpenseMutation } from "@/services/api";
import { CreateExpenseData } from "@/types";
import { useState } from "react";
import { Alert } from "react-native";

export const useCreateExpense = () => {
  const createExpenseMutation = useCreateExpenseMutation();
  const [formData, setFormData] = useState<CreateExpenseData>({
    name: "",
    amount: "",
    description: "",
  });

  const updateFormData = (field: keyof CreateExpenseData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmountChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    const parts = numericText.split(".");
    if (parts.length > 2) return;
    if (parts.length === 2 && parts[1].length > 2) return;
    updateFormData("amount", numericText);
  };

  const resetForm = () => {
    setFormData({ name: "", amount: "", description: "" });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter expense name");
      return false;
    }

    if (formData.name.trim().length < 2) {
      Alert.alert(
        "Validation Error",
        "Expense name must be at least 2 characters long"
      );
      return false;
    }

    if (!formData.amount.trim()) {
      Alert.alert("Validation Error", "Please enter expense amount");
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid positive amount");
      return false;
    }

    if (amount > 999999.99) {
      Alert.alert("Validation Error", "Amount cannot exceed $999,999.99");
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert("Validation Error", "Please enter expense description");
      return false;
    }

    if (formData.description.trim().length < 3) {
      Alert.alert(
        "Validation Error",
        "Description must be at least 3 characters long"
      );
      return false;
    }

    return true;
  };

  return {
    formData,
    updateFormData,
    handleAmountChange,
    resetForm,
    validateForm,
    createExpense: createExpenseMutation.mutateAsync,
    isPending: createExpenseMutation.isPending,
  };
};
