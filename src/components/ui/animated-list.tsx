import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
}

const AnimatedList = React.forwardRef<HTMLDivElement, AnimatedListProps>(
  ({ className, children, staggerDelay = 50, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              style: {
                ...(child.props.style || {}),
                animationDelay: `${index * staggerDelay}ms`,
              },
              className: cn(
                child.props.className,
                "animate-fade-in opacity-0"
              ),
            });
          }
          return child;
        })}
      </div>
    );
  }
);
AnimatedList.displayName = "AnimatedList";

interface AnimatedListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AnimatedListItem = React.forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-fade-in opacity-0 transition-all duration-300",
          "hover:translate-x-1",
          className
        )}
        style={{
          animationFillMode: "forwards",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AnimatedListItem.displayName = "AnimatedListItem";

export { AnimatedList, AnimatedListItem };
