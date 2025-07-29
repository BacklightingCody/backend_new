// Common types and interfaces

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  category?: string;
  tags?: string[];
}

// User related types
export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}

// Article related types
export interface ArticleFilters extends SearchQuery {
  userId?: number;
  isPublished?: boolean;
  isDraft?: boolean;
}

// BookStack related types
export interface BookStackFilters extends SearchQuery {
  isCompleted?: boolean;
  minRating?: number;
  maxRating?: number;
  language?: string;
}
