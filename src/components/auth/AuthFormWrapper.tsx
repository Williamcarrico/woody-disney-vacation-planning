"use client"

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface AuthFormWrapperProps {
    readonly children: ReactNode
    readonly title: string
    readonly description?: string
    readonly footer?: ReactNode
    readonly className?: string
}

export function AuthFormWrapper({
    children,
    title,
    description,
    footer,
    className
}: Readonly<AuthFormWrapperProps>) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-950 dark:to-slate-900">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center">
                <Link href="/" className="flex items-center justify-center mb-4">
                    <Image
                        src="/images/disney_logo.png"
                        alt="Disney Vacation Planning"
                        width={180}
                        height={60}
                        className="transition-all hover:opacity-80"
                    />
                </Link>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            </div>

            {/* Form Card */}
            <Card className={cn("w-full max-w-md shadow-lg dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm", className)}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
                    {description && <CardDescription className="text-center">{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
                {footer && (
                    <CardFooter className="flex flex-col items-center">
                        {footer}
                    </CardFooter>
                )}
            </Card>

            {/* Background decorations */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
    )
}