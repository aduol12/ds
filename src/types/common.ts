export interface ApiErrorBody {
  message?: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type RequestStatus = "idle" | "loading" | "success" | "error";
