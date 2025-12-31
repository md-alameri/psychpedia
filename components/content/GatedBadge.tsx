'use client';

interface GatedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

/**
 * Badge component to indicate gated content
 * Used to mark sections that require authentication/subscription
 */
export default function GatedBadge({ label = 'Gated', size = 'sm' }: GatedBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        bg-accent-light text-white
        ${sizeClasses[size]}
      `}
      title="This content requires registration"
    >
      {label}
    </span>
  );
}

