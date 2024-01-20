import { useAuth } from '@clerk/nextjs';

export function useGetAuthToken() {
  const { getToken } = useAuth();

  function getAuthToken() {
    return getToken({
      template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
    });
  }

  return {
    getAuthToken,
  };
}
