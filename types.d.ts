export interface User {
  id: string;
  createdAt: string;
  username: string;
  password: string;
}

export interface Expense {
  id: string;
  createdAt: string;
  name: string;
  amount: string;
  description: string;
}

export interface CreateExpenseData {
  name: string;
  amount: string;
  description: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

