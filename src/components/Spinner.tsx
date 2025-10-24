interface SpinnerProps {
  label?: string;
  className?: string;
}

export default function Spinner({ label = 'Loading…', className = '' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 text-sm text-slate-500 ${className}`}>
      <span className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-indigo-200 border-t-indigo-500" />
      <span>{label}</span>
    </div>
  );
}
