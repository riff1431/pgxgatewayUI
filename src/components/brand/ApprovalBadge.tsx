interface ApprovalBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ApprovalBadge({ className = '', size = 'md' }: ApprovalBadgeProps) {
  const sizeClasses = {
    sm: 'w-28 sm:w-36',
    md: 'w-40 sm:w-48 lg:w-52',
    lg: 'w-56 sm:w-68 lg:w-80',
  }

  return (
    <div className={`relative flex items-center justify-center select-none group ${className}`}>
      {/* Outer Multi-Tier Radiant Glow */}
      <div className="absolute inset-0 bg-purple-600/35 blur-2xl -z-10 rounded-full group-hover:bg-purple-600/50 transition-all duration-500" />
      <div className="absolute inset-0 bg-cyan-400/20 blur-xl -z-10 rounded-full group-hover:bg-cyan-400/35 transition-all duration-500" />
      <div className="absolute -top-4 w-24 h-24 bg-amber-400/25 blur-xl -z-10 rounded-full" />

      {/* 3D Luxury Emblem Asset with Hover Micro-Interaction */}
      <img
        src="/approval-badge-3d.png"
        alt="99% Approval Rate For Our Gateway"
        className={`${sizeClasses[size]} h-auto object-contain drop-shadow-[0_12px_28px_rgba(168,85,247,0.55)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1`}
        loading="lazy"
      />
    </div>
  )
}
