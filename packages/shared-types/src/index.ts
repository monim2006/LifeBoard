// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  theme: 'light' | 'dark';
  currency: string;
  weekStartDay: 'Monday' | 'Sunday';
  xp: number;
  level: number;
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

// ─── Daily Log ──────────────────────────────────────────────────────────────

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  mood?: number;
  energy?: number;
  sleepHours?: number;
  sleepQuality?: number;
  waterGlasses?: number;
  workout: boolean;
  workoutNotes?: string;
  journalEntry?: string;
  notes?: string;
  tomorrowPlan?: string;
  aiSummary?: string;
  timelineEvents: TimelineEvent[];
  meals: Meal[];
  attachments: Attachment[];
}

export interface CreateDailyLogInput {
  date: string;
  mood?: number;
  energy?: number;
  sleepHours?: number;
  sleepQuality?: number;
  waterGlasses?: number;
  workout?: boolean;
  workoutNotes?: string;
  journalEntry?: string;
  notes?: string;
  tomorrowPlan?: string;
}

export interface UpdateDailyLogInput {
  mood?: number;
  energy?: number;
  sleepHours?: number;
  sleepQuality?: number;
  waterGlasses?: number;
  workout?: boolean;
  workoutNotes?: string;
  journalEntry?: string;
  notes?: string;
  tomorrowPlan?: string;
}

// ─── Timeline Event ─────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  dailyLogId: string;
  userId: string;
  date: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  category: string;
  color?: string;
  order: number;
}

export interface CreateTimelineEventInput {
  date: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  category: string;
  color?: string;
}

export interface UpdateTimelineEventInput {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  color?: string;
}

// ─── Meal ───────────────────────────────────────────────────────────────────

export interface Meal {
  id: string;
  dailyLogId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories?: number;
  notes?: string;
  time?: string;
}

export interface CreateMealInput {
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories?: number;
  notes?: string;
  time?: string;
}

// ─── Attachment ─────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  dailyLogId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size?: number;
}

// ─── Weekly Plan ────────────────────────────────────────────────────────────

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

// ─── Expense ────────────────────────────────────────────────────────────────

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

export interface CreateExpenseInput {
  amount: number;
  category: string;
  subCategory?: string;
  description?: string;
  date: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  tags?: string[];
  location?: string;
}

// ─── Income ─────────────────────────────────────────────────────────────────

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  tags: string[];
}

export interface CreateIncomeInput {
  amount: number;
  source: string;
  description?: string;
  date: string;
  isRecurring?: boolean;
  tags?: string[];
}

// ─── Budget ─────────────────────────────────────────────────────────────────

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

// ─── Habit ──────────────────────────────────────────────────────────────────

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  unit?: string;
  color?: string;
  icon?: string;
  logs: HabitLog[];
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  category: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  target?: number;
  unit?: string;
  color?: string;
  icon?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  note?: string;
}

export interface CreateHabitLogInput {
  habitId: string;
  date: string;
  value?: number;
  note?: string;
}

// ─── Goal ───────────────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  targetDate?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number;
  color?: string;
  milestones: Milestone[];
  projects: Project[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: string;
  startDate?: string;
  targetDate?: string;
  color?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface CreateMilestoneInput {
  title: string;
  order?: number;
}

// ─── Project ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  userId: string;
  goalId?: string;
  name: string;
  description?: string;
  color?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  deadline?: string;
  tasks: ProjectTask[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  goalId?: string;
  color?: string;
  deadline?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  order: number;
}

export interface CreateProjectTaskInput {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  deadline?: string;
}

// ─── Achievement ────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  icon?: string;
  xpReward: number;
  unlockedAt: string;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  archived: boolean;
  order: number;
}

export type CategoryType = 'task' | 'expense' | 'income' | 'project' | 'goal' | 'habit' | 'meal' | 'journal' | 'note' | 'timeline';

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
  archived?: boolean;
  order?: number;
}

// ─── Notification ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

// ─── Backup ─────────────────────────────────────────────────────────────────

export interface Backup {
  id: string;
  userId: string;
  filename: string;
  size: number;
  createdAt: string;
}

// ─── API Response ───────────────────────────────────────────────────────────

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
