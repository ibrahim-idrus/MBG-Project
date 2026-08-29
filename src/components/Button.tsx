import type { FC, Child } from 'hono/jsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  shape?: 'pill' | 'rounded';
  children: Child;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onclick?: string;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  shape = 'pill',
  children,
  className = '',
  type = 'button',
  onclick,
}) => {
  const base = 'font-label-md text-label-md flex items-center justify-center gap-2 transition-colors active:scale-[0.98] duration-200';
  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-lg';

  const variants: Record<string, string> = {
    primary: 'bg-primary text-on-primary px-6 py-2.5 hover:bg-primary-container hover:text-on-primary-container shadow-sm',
    secondary: 'border border-primary text-primary px-6 py-2.5 hover:bg-primary/5',
    ghost: 'text-on-surface-variant px-4 py-2 hover:bg-surface-container-high hover:text-primary',
  };

  return (
    <button
      type={type}
      class={`${base} ${shapeClass} ${variants[variant]} ${className}`}
      onclick={onclick}
    >
      {children}
    </button>
  );
};
