import axios from 'axios';
import type { ApiErrorShape } from '@/types';

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  return typeof value === 'object' && value !== null && 'message' in value;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please check your connection and try again.';
    }
    if (!error.response) {
      return 'We could not reach the store API. Please check your connection and retry.';
    }
    const data = error.response.data;
    if (isApiErrorShape(data) && typeof data.message === 'string') {
      return data.message;
    }
    return `Request failed with status ${error.response.status}.`;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
