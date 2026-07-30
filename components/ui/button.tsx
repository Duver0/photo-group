import { ButtonHTMLAttributes, forwardRef } from "react"

const variants = {
  primary: "bg-gold text-ink hover:bg-gold-light focus:ring-gold-light",
  secondary: "bg-ink-light text-cream border border-gold/30 hover:border-gold/60 focus:ring-gold",
  outline: "border border-gold/50 text-gold hover:bg-gold/10 focus:ring-gold",
  ghost: "text-gold hover:bg-gold/10 focus:ring-gold",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
