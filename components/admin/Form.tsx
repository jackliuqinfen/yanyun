import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// --- Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth = true, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          className={`
            w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none
            ${error 
              ? 'border-red-300 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' 
              : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300'
            }
            ${props.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-900'}
            ${className}
          `}
          {...props}
        />
        {error && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle size={16} />
           </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">{error}</p>}
    </div>
  );
};

// --- Select Component ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, fullWidth = true, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
         <select
           className={`
             w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none appearance-none
             ${error 
               ? 'border-red-300 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' 
               : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300'
             }
             ${className}
           `}
           {...props}
         >
           {options.map(opt => (
             <option key={opt.value} value={opt.value}>{opt.label}</option>
           ))}
         </select>
         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 pl-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
         </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 focus:ring-indigo-500/30 border border-transparent",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500/30 border border-transparent",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500/20",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500/20 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
