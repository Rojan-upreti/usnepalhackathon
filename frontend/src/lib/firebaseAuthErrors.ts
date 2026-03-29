import { FirebaseError } from 'firebase/app'

export type AuthErrorContext = 'email-signin' | 'email-register' | 'google'

function isFirebaseError(e: unknown): e is FirebaseError {
  return e instanceof FirebaseError
}

/**
 * Turns Firebase Auth error codes into short, actionable copy for the UI.
 */
export function getFirebaseAuthErrorMessage(error: unknown, context: AuthErrorContext): string {
  if (!isFirebaseError(error)) {
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  }

  const { code } = error

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      if (context === 'google') {
        return 'Google sign-in did not complete. Try again, pick another Google account, or sign in with email and password.'
      }
      if (context === 'email-register') {
        return 'We could not create an account with those details. Try a different email or sign-in method.'
      }
      return 'That email or password is not correct. Try again, or use Sign up if you still need an account.'

    case 'auth/invalid-email':
      return 'Enter a valid email address.'

    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support if you think this is a mistake.'

    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Sign in instead, or use a different email.'

    case 'auth/weak-password':
      return 'Use a stronger password (at least 6 characters; longer is better).'

    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'

    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'

    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Try again when you are ready.'

    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'

    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled for this app. Ask your administrator to enable it in Firebase Authentication.'

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method. Sign in with the method you used before.'

    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another user.'

    default:
      return 'Sign-in failed. Please try again.'
  }
}
