import { useEffect, useRef, useState } from 'react'
import Highlighter from './Highlighter'

// Enhanced code editor with line numbers and lightweight syntax highlighting
export default function Editor({ value, language = 'javascript', onChange }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)
  const [scrollSync, setScrollSync] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const ta = textareaRef.current
    const gutter = gutterRef.current
    if (!ta || !gutter) return

    const sync = () => {
      const lines = ta.value.split('\n').length
      const nums = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
      gutter.textContent = nums
      gutter.scrollTop = ta.scrollTop
      setScrollSync({ x: ta.scrollLeft, y: ta.scrollTop })
    }

    sync()
    ta.addEventListener('input', sync)
    const onScroll = () => {
      gutter.scrollTop = ta.scrollTop
      setScrollSync({ x: ta.scrollLeft, y: ta.scrollTop })
    }
    ta.addEventListener('scroll', onScroll)
    return () => {
      ta.removeEventListener('input', sync)
      ta.removeEventListener('scroll', onScroll)
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
        <div className="relative flex-1">
          <Highlighter code={value} language={language} onScrollSync={scrollSync} />
          <textarea
            ref={textareaRef}
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 bg-transparent outline-none resize-none p-2 leading-6 font-mono text-sm text-transparent caret-white selection:bg-white/20"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  )
}
