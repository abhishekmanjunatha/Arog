import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  message?: string
  className?: string
  size?: "sm" | "default" | "lg"
}

const sizeMap = {
  sm: "h-6 w-6",
  default: "h-10 w-10",
  lg: "h-16 w-16",
}

export function LoadingState({ message = "Loading...", className, size = "default" }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="relative">
        <Loader2 className={cn(sizeMap[size], "text-primary animate-spin")} />
        <div className={cn(sizeMap[size], "absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20")} />
      </div>
      {message && (
        <p className="mt-4 text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  )
}

/**
 * Skeleton Loading Component for content placeholders
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}
