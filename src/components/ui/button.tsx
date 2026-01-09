import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-poppins font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-primary bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/80 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-accent/10 hover:text-accent hover:scale-105 active:scale-100",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        // Nova variante premium com gradiente
        premium: "bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1 active:translate-y-0 border-0",
        // Variante para ações principais com destaque
        cta: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-1 active:translate-y-0 animate-pulse-subtle",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-14 rounded-lg px-10 text-xl",
        icon: "h-11 w-11 hover:rotate-3 active:rotate-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
