import { message } from '@/components/ui';
import { extractApiErrorMessage } from '@/services/api/apiClient';

export const notifyError = (err: any, fallback?: string) => {
  try {
    const normalized = extractApiErrorMessage(err);
    message.error(normalized || fallback || 'Something went wrong', 4);
  } catch {
    message.error(fallback || 'Something went wrong', 4);
  }
};

export const notifySuccess = (msg: string) => {
  message.success(msg, 2.5);
};

export const notifyWarning = (msg: string) => {
  message.warning(msg, 3);
};

export const notifyInfo = (msg: string) => {
  message.info(msg, 2.5);
};

