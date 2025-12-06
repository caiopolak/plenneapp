import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  hover?: boolean;
  children: React.ReactNode;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, hover = true, children, style, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "animate-fade-in opacity-0",
          hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
          className
        )}
        style={{
          animationDelay: `${delay}ms`,
          animationFillMode: "forwards",
          ...style,
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

// Re-export card parts for convenience
const AnimatedCardHeader = CardHeader;
const AnimatedCardTitle = CardTitle;
const AnimatedCardDescription = CardDescription;
const AnimatedCardContent = CardContent;
const AnimatedCardFooter = CardFooter;

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
};
