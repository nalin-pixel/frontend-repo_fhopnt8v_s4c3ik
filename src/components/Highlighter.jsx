import { useEffect, useMemo, useRef } from 'react'

// Very lightweight syntax highlighter using regex and content overlay
// Supports: js/ts, jsx basics, html, css
export default function Highlighter({ code = '', language = 'javascript', onScrollSync }) {
  const preRef = useRef(null)

  const highlighted = useMemo(() => {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const rules = {
      javascript: [
        [/\b(function|return|const|let|var|if|else|for|while|class|new|try|catch|throw|switch|case|break|import|from|export|default)\b/g, 'text-emerald-400'],
        [/\b(true|false|null|undefined)\b/g, 'text-amber-300'],
        [/(\/\*[^]*?\*\/|\/\/.*$)/gm, 'text-zinc-500'],
        [/("[^"]*"|'[^']*'|`[^`]*`)/g, 'text-rose-300'],
        [/\b(\d+(?:\.\d+)?)\b/g, 'text-sky-300'],
      ],
      html: [
        [/(<\/?[a-zA-Z0-9\-]+)(?=[^>]*>)/g, 'text-sky-400'],
        [/([a-zA-Z\-]+)(=)/g, 'text-emerald-400'],
        [/("[^"]*"|'[^']*')/g, 'text-rose-300'],
        [/(<!--[^]*?-->)/g, 'text-zinc-500'],
      ],
      css: [
        [/\b([a-z\-]+)(?=\s*:)/g, 'text-emerald-400'],
        [/#[0-9a-fA-F]{3,6}|rgb\([^\)]*\)/g, 'text-sky-300'],
        [/("[^"]*"|'[^']*')/g, 'text-rose-300'],
        [/(\/\*[^]*?\*\/)/g, 'text-zinc-500'],
        [/\b(\d+(?:\.\d+)?)(px|rem|em|%)?\b/g, 'text-amber-300'],
      ],
    }

    const apply = (s, lang) => {
      let out = esc(s)
      const set = rules[lang] || []
      set.forEach(([re, cls]) => {
        out = out.replace(re, (m) => `<span class="${cls}">${m}</span>`)
      })
      return out
    }

    const lang = language.startsWith('html') ? 'html' : language.startsWith('css') ? 'css' : 'javascript'
    return apply(code, lang)
  }, [code, language])

  useEffect(() => {
    const el = preRef.current
    if (!el) return
    el.scrollTop = onScrollSync?.y ?? el.scrollTop
    el.scrollLeft = onScrollSync?.x ?? el.scrollLeft
  }, [onScrollSync])

  return (
    <pre
      ref={preRef}
      className="pointer-events-none absolute inset-0 m-0 p-2 leading-6 font-mono text-sm whitespace-pre-wrap break-words"
      style={{ tabSize: 2 }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}
