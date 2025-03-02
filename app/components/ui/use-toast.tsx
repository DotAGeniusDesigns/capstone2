"use client"

import * as React from "react"
import { useEffect, useState } from "react"

import { cn } from "../../lib/utils"
import { X } from "lucide-react"

import type {
    ToastActionElement,
    ToastProps,
} from "./toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ActionType = typeof actionTypes

type Action =
    | {
        type: ActionType["ADD_TOAST"]
        toast: ToasterToast
    }
    | {
        type: ActionType["UPDATE_TOAST"]
        toast: Partial<ToasterToast>
    }
    | {
        type: ActionType["DISMISS_TOAST"]
        toastId?: string
    }
    | {
        type: ActionType["REMOVE_TOAST"]
        toastId?: string
    }

interface State {
    toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case "DISMISS_TOAST": {
            const { toastId } = action

            if (toastId) {
                toastTimeouts.set(
                    toastId,
                    setTimeout(() => {
                        toastTimeouts.delete(toastId)
                        dispatch({
                            type: "REMOVE_TOAST",
                            toastId,
                        })
                    }, TOAST_REMOVE_DELAY)
                )
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            duration: 0,
                        }
                        : t
                ),
            }
        }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
    }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: ToasterToast) =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            duration: props.duration || 5000,
        },
    })

    return {
        id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = useState<State>(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}

export { useToast, toast }

export function Toaster() {
    const { toasts } = useToast()

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(function ({ id, title, description, action, variant, duration }) {
                return (
                    <div
                        key={id}
                        className={cn(
                            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                            {
                                "border-destructive bg-destructive text-destructive-foreground":
                                    variant === "destructive",
                                "border-border bg-background text-foreground": variant !== "destructive",
                            }
                        )}
                        style={{ marginBottom: "1rem" }}
                    >
                        <div className="grid gap-1">
                            {title && <div className="text-sm font-semibold">{title}</div>}
                            {description && (
                                <div className="text-sm opacity-90">{description}</div>
                            )}
                        </div>
                        {action}
                        <button
                            onClick={() => dispatch({ type: "DISMISS_TOAST", toastId: id })}
                            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                )
            })}
        </div>
    )
} 