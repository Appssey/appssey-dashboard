export interface App {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: Category;
  screens: Screen[];
  updated: boolean;
  updatedAt: Date;
  platform?: string;
  category_id?: string;
}

export interface Screen {
  id: string;
  url: string;
  alt: string;
}

export type Category = 
  | 'All'
  | 'Finance'
  | 'Business'
  | 'Health & Fitness'
  | 'Food & Drink'
  | 'Education'
  | 'Shopping'
  | 'Artificial Intelligence'
  | 'Travel & Transportation'
  | 'Lifestyle'
  | 'Entertainment'
  | 'Communication';

export interface User {
  id: string;
  email: string;
  name?: string;
  status?: string; // 'active' | 'inactive'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}