import { useEffect, useRef } from 'react'

// Lightweight code editor with line numbers and basic syntax colors
export default function Editor({ value, language = 'javascript', onChange }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    const gutter = gutterRef.current
    if (!ta || !gutter) return

    const sync = () => {
      const lines = ta.value.split('\n').length
      const nums = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
      gutter.textContent = nums
      gutter.scrollTop = ta.scrollTop
    }

    sync()
    ta.addEventListener('input', sync)
    ta.addEventListener('scroll', () => (gutter.scrollTop = ta.scrollTop))
    return () => {
      ta.removeEventListener('input', sync)
    }
  }, [value])

  return (
    <div className="relative h-full w-full bg-[#0f111a] text-zinc-100 rounded-md overflow-hidden border border-zinc-800">
      <div className="absolute inset-0 flex">
        <pre
          ref={gutterRef}
          aria-hidden
          className="select-none w-12 shrink-0 bg-[#0b0d14] text-zinc-500 text-right pr-2 py-2 overflow-hidden leading-6"
          style={{ tabSize: 2 }}
        />
        <textarea
          ref={textareaRef}
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none resize-none p-2 leading-6 font-mono text-sm"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  )
}
