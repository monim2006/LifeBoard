// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  theme: 'light' | 'dark';
  currency: string;
  weekStartDay: 'Monday' | 'Sunday';
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Plan Types
export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  isTemplate: boolean;
  templateName?: string;
  timeBlocks: TimeBlock[];
}

export interface TimeBlock {
  id: string;
  planId: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  completedAt?: string;
  color?: string;
  isRecurring: boolean;
}

// Expense Types
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  subCategory?: string;
  description?: string;
  date: string;
  paymentMethod?: string;
  isRecurring: boolean;
  tags: string[];
  location?: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  alertThreshold: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page: number;
    totalPages: number;
    total: number;
  };
}
