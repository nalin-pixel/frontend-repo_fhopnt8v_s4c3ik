import { useEffect, useRef } from 'react'
import { Eraser, TerminalSquare } from 'lucide-react'

export default function Console({ logs, onClear }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md overflow-hidden flex flex-col">
      <div className="h-9 flex items-center justify-between px-3 border-b border-zinc-800 bg-zinc-900/70">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <TerminalSquare size={16} className="text-emerald-400" />
          Console
        </div>
        <button onClick={onClear} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
          <Eraser size={14} /> Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
        {logs.length === 0 && (
          <div className="text-zinc-500">Console ready. Run your code to see output here.</div>
        )}
        {logs.map((entry, i) => (
          <div key={i} className="whitespace-pre-wrap">
            <span className={
              entry.type === 'error' ? 'text-red-400' : entry.type === 'warn' ? 'text-amber-300' : 'text-zinc-100'
            }>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
