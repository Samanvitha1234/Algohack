import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: string } | undefined;
    if (payload?.error) return payload.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
