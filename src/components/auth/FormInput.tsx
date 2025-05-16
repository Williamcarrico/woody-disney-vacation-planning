"use client"

import { ChangeEvent, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

interface FormInputProps {
    readonly id: string
    readonly label: string
    readonly type?: string
    readonly placeholder?: string
    readonly value: string
    readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void
    readonly error?: string
    readonly required?: boolean
    readonly className?: string
}

export function FormInput({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    required = false,
    className
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const passwordFieldType = showPassword ? 'text' : 'password'
    const inputType = type === 'password' ? passwordFieldType : type

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            </div>
            <div className="relative">
                <Input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        "w-full",
                        error ? "border-red-500 focus:ring-red-500" : ""
                    )}
                    aria-invalid={!!error}
                />

                {type === 'password' && (
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                        ) : (
                            <EyeIcon className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}