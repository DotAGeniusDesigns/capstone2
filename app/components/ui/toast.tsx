"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground",
                destructive:
                    "destructive group border-destructive bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
    onOpenChange?: (open: boolean) => void
    duration?: number
}

export type ToastActionElement = React.ReactElement

export function Toast({
    className,
    variant,
    onOpenChange,
    children,
    ...props
}: ToastProps) {
    return (
        <div
            className={cn(toastVariants({ variant }), className)}
            {...props}
            data-state="open"
        >
            {children}
        </div>
    )
}

export function ToastAction({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function ToastClose({
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
                className
            )}
            toast-close=""
            {...props}
        >
            <X className="h-4 w-4" />
        </button>
    )
}

export function ToastTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("text-sm font-semibold", className)}
            {...props}
        />
    )
}

export function ToastDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("text-sm opacity-90", className)}
            {...props}
        />
    )
}

export function ToastProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
} 