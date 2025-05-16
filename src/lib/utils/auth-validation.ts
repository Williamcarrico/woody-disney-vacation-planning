// Email validation using regex
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Password validation: at least 8 chars, must include letter and number
export const isValidPassword = (password: string): boolean => {
    return password.length >= 8 &&
        /[A-Za-z]/.test(password) &&
        /\d/.test(password)
}

// Display-friendly password requirements
export const getPasswordRequirements = (): string[] => [
    "At least 8 characters",
    "Include at least one letter",
    "Include at least one number"
]

// Check if passwords match
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword
}

// Get error message for email validation
export const getEmailErrorMessage = (email: string): string => {
    if (!email) return "Email is required"
    if (!isValidEmail(email)) return "Please enter a valid email address"
    return ""
}

// Get error message for password validation
export const getPasswordErrorMessage = (password: string): string => {
    if (!password) return "Password is required"
    if (!isValidPassword(password)) {
        const requirements = getPasswordRequirements()
        return `Password must meet requirements: ${requirements.join(", ")}`
    }
    return ""
}

// Get error message for password confirmation
export const getConfirmPasswordErrorMessage = (
    password: string,
    confirmPassword: string
): string => {
    if (!confirmPassword) return "Please confirm your password"
    if (!doPasswordsMatch(password, confirmPassword)) return "Passwords do not match"
    return ""
}

// Get error message for name validation
export const getNameErrorMessage = (name: string): string => {
    if (!name) return "Name is required"
    if (name.length < 2) return "Name must be at least 2 characters"
    return ""
}

// Firebase error message helper
interface FirebaseError {
    code?: string;
    message?: string;
}

export const getFirebaseErrorMessage = (error: FirebaseError): string => {
    const errorCode = error?.code || ""

    const errorMessages: Record<string, string> = {
        "auth/email-already-in-use": "An account with this email address already exists.",
        "auth/invalid-email": "The email address is not valid.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/user-not-found": "No account found with this email address.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid login credentials. Please check your email and password.",
        "auth/weak-password": "Password is too weak. Please choose a stronger password.",
        "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
        "auth/operation-not-allowed": "This operation is not allowed.",
        "auth/network-request-failed": "A network error occurred. Please check your connection and try again.",
        "auth/too-many-requests": "Too many unsuccessful login attempts. Please try again later.",
        "auth/requires-recent-login": "This operation requires re-authentication. Please log in again.",
    }

    return errorMessages[errorCode] || "An unexpected error occurred. Please try again."
}