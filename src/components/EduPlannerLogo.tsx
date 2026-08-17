import React from 'react';
import { GraduationCap, BookOpen, Cpu, Sparkles } from 'lucide-react';

interface EduPlannerLogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const EduPlannerLogo: React.FC<EduPlannerLogoProps> = ({
  collapsed = false,
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const iconSizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-13 h-13 p-2.5'
  };

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Premium Gradient Logo Badge: Graduation Cap + Open Book + AI Circuit */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] via-[#7C3AED] to-[#06B6D4] text-white shadow-lg shadow-blue-500/25 border border-white/20 shrink-0 ${iconSizeClasses[size]}`}>
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Base Layer: Open Book */}
          <BookOpen className="w-4 h-4 text-cyan-200/90 absolute bottom-0.5" />
          {/* Top Layer: Graduation Cap */}
          <GraduationCap className="w-5 h-5 text-white absolute -top-0.5" />
          {/* Circuit / AI Node Sparkle */}
          <Cpu className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>

      {/* Brand Text */}
      {!collapsed && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent ${titleSizeClasses[size]}`}>
              EduPlanner
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
              AI
            </span>
          </div>

          {showTagline && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
              Plan Smarter. Research Faster. Learn Better.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
