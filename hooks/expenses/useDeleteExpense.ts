import { useDeleteExpense as useDeleteExpenseMutation } from "@/services/api";

export const useDeleteExpense = () => {
  const deleteMutation = useDeleteExpenseMutation();

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteMutation.mutateAsync(expenseId);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete expense";
      throw new Error(errorMessage);
    }
  };

  return {
    handleDeleteExpense,
    isPending: deleteMutation.isPending,
  };
};
