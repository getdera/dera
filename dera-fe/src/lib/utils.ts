import { notifications } from '@mantine/notifications';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * This uses the Mantine notifications library to show a notification, hence must be called
 * in a component within MantineProvider, and Notifications component should be rendered in the app.
 */
export function showErrorNotification(message: string) {
  notifications.show({
    title: 'Error',
    color: 'red',
    autoClose: 10000,
    withBorder: true,
    withCloseButton: true,
    message,
  });
}

/**
 * This uses the Mantine notifications library to show a notification, hence must be called
 * in a component within MantineProvider, and Notifications component should be rendered in the app.
 */
export function showSuccessNotification(message: string) {
  notifications.show({
    title: 'Success',
    color: 'green',
    autoClose: 10000,
    withBorder: true,
    withCloseButton: true,
    message,
  });
}

const IDENTIFIER_REGEX = /^[^\d][a-z0-9_]+$/g;
const MAX_LENGTH = 64;

export function isValidPostgresIdentifier(s: string) {
  return (
    !!s &&
    s.trim().length > 0 &&
    !!s.match(IDENTIFIER_REGEX) &&
    s.length <= MAX_LENGTH
  );
}
