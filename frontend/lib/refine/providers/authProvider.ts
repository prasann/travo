/**
 * Refine Auth Provider for Firebase Authentication
 * 
 * Phase 7: Auth Provider Integration
 * 
 * Bridges Refine's AuthProvider interface with our existing Firebase auth implementation.
 */

import type { AuthProvider } from "@refinedev/core";
import { signInWithGoogle, signOut as firebaseSignOut } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/config";

export const authProvider: AuthProvider = {
  /**
   * Handle login - triggers Google sign-in
   */
  login: async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Failed to sign in with Google",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error instanceof Error ? error.message : "Login failed",
        },
      };
    }
  },

  /**
   * Handle logout
   */
  logout: async () => {
    try {
      await firebaseSignOut();
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: error instanceof Error ? error.message : "Logout failed",
        },
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  check: async () => {
    const user = auth.currentUser;
    
    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Not authenticated",
        name: "Unauthorized",
      },
      logout: true,
      redirectTo: "/",
    };
  },

  /**
   * Get user permissions (not implemented - all authenticated users have same permissions)
   */
  getPermissions: async () => {
    return null;
  },

  /**
   * Get current user identity
   */
  getIdentity: async () => {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    return {
      id: user.uid,
      name: user.displayName || user.email || "User",
      email: user.email || "",
      avatar: user.photoURL || undefined,
    };
  },

  /**
   * Handle authentication errors
   */
  onError: async (error) => {
    console.error("[AuthProvider] Error:", error);
    
    // Check if it's an auth error that requires logout
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/",
        error,
      };
    }

    return { error };
  },
};
