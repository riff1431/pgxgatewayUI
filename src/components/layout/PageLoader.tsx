import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  )
}
