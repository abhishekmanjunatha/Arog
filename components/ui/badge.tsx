import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-input",
        success: "border-transparent bg-green-50 text-green-700 border border-green-200",
        warning: "border-transparent bg-amber-50 text-amber-700 border border-amber-200",
        info: "border-transparent bg-blue-50 text-blue-700 border border-blue-200",
        // Status-specific variants for appointments/patients
        scheduled: "border-transparent bg-blue-50 text-blue-700 border border-blue-200",
        completed: "border-transparent bg-green-50 text-green-700 border border-green-200",
        cancelled: "border-transparent bg-red-50 text-red-700 border border-red-200",
        active: "border-transparent bg-green-50 text-green-700 border border-green-200",
        inactive: "border-transparent bg-gray-100 text-gray-600 border border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
