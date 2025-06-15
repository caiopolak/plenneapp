
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Sparkles, Trophy, Target, Wallet, TrendingUp, BookOpen } from "lucide-react";

const variantIcons: Record<string, React.ReactNode> = {
  success: <Sparkles className="w-5 h-5 text-green-600" />,
  destructive: <Trophy className="w-5 h-5 text-red-500" />,
  plenne: <BookOpen className="w-5 h-5 text-blue-600" />,
  default: <Sparkles className="w-5 h-5 text-[#003f5c]" />,
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {/* Ícone à esquerda do título, se houver */}
              <div className="flex items-center gap-2">
                {variantIcons[variant] || variantIcons["default"]}
                {title && <ToastTitle>{title}</ToastTitle>}
              </div>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
