import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import { useToast } from "../context/ToastContext";

export function useAppAuth() {
  const { user: clerkUser } = useUser();
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { openSignIn, signOut } = useClerk();
  const { showToast } = useToast();

  const user = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        imageUrl: clerkUser.imageUrl || "",
      }
    : null;

  const handleOpenSignIn = (opts = {}) => {
    openSignIn({
      fallbackRedirectUrl: window.location.pathname || "/app",
      ...opts,
    });
  };

  return {
    user,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    getToken,
    getAccessToken: getToken,
    openSignIn: handleOpenSignIn,
    signOut,
    logout: signOut,
    showToast,
  };
}

export const useAuth = useAppAuth;
export default useAppAuth;
