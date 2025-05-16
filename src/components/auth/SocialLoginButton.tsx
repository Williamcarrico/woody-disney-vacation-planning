"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SocialLoginButtonProps {
    readonly provider: "google" | "apple" | "facebook"
    readonly onClick: () => Promise<void>
    readonly className?: string
}

export function SocialLoginButton({
    provider,
    onClick,
    className
}: SocialLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        try {
            setIsLoading(true)
            await onClick()
        } catch (error) {
            console.error(`Error signing in with ${provider}:`, error)
        } finally {
            setIsLoading(false)
        }
    }

    const icons = {
        google: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2704 14.29L1.28039 17.385C3.25539 21.31 7.31039 24 12.0004 24Z" fill="#34A853" />
            </svg>
        ),
        apple: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.6719 12.5323C17.6962 15.9935 20.6442 17.0836 20.6826 17.1015C20.6635 17.1676 20.2226 18.5953 19.2318 20.0665C18.3853 21.3089 17.4961 22.5392 16.1289 22.5642C14.8065 22.5889 14.3657 21.7564 12.8185 21.7564C11.2714 21.7564 10.7859 22.5392 9.54199 22.589C8.22439 22.6387 7.19256 21.2466 6.33662 20.0123C4.57959 17.4828 3.25879 12.9384 5.0667 9.87264C5.96533 8.35116 7.56221 7.3984 9.3042 7.37384C10.5762 7.34932 11.7695 8.2572 12.5496 8.2572C13.3296 8.2572 14.7749 7.14248 16.3092 7.32904C16.9702 7.35548 18.8729 7.60556 20.0967 9.34624C19.9919 9.4124 17.6536 10.7372 17.6719 12.5323ZM15.0399 5.4824C15.7618 4.60364 16.2397 3.37756 16.0962 2.1606C15.0417 2.2063 13.7288 2.85244 12.9702 3.7312C12.2982 4.51864 11.7217 5.7812 11.8837 6.9617C13.057 7.06392 14.3179 6.36112 15.0399 5.4824Z" />
            </svg>
        ),
        facebook: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M24 12.0735C24 5.40591 18.6274 0 12 0C5.37262 0 0 5.40591 0 12.0735C0 18.0995 4.38825 23.0924 10.125 24V15.5633H7.07812V12.0735H10.125V9.41269C10.125 6.38565 11.9166 4.71511 14.6576 4.71511C15.9701 4.71511 17.3438 4.95071 17.3438 4.95071V7.92267H15.8306C14.34 7.92267 13.875 8.85375 13.875 9.80958V12.0735H17.2031L16.6711 15.5633H13.875V24C19.6118 23.0924 24 18.0995 24 12.0735Z" />
            </svg>
        )
    }

    const labels = {
        google: "Continue with Google",
        apple: "Continue with Apple",
        facebook: "Continue with Facebook"
    }

    const colors = {
        google: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300",
        apple: "bg-black hover:bg-black/90 text-white",
        facebook: "bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
    }

    return (
        <Button
            variant="outline"
            className={cn(
                "w-full flex items-center justify-center gap-2",
                colors[provider],
                className
            )}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                icons[provider]
            )}
            {labels[provider]}
        </Button>
    )
}