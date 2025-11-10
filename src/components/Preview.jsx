import { useEffect, useRef } from 'react'
import { RefreshCw, MonitorSmartphone } from 'lucide-react'

export default function Preview({ html, css, js, onRefresh }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const content = `<!doctype html><html><head><style>${css || ''}</style></head><body>${html || ''}<script>${js || ''}<\/script></body></html>`
    doc.open()
    doc.write(content)
    doc.close()
  }, [html, css, js])

  return (
    <div className="h-full w-full bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col">
      <div className="h-9 flex items-center justify-between px-3 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2 text-zinc-700 text-sm">
          <MonitorSmartphone size={16} className="text-blue-500" />
          Preview
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <iframe ref={iframeRef} title="preview" className="flex-1 w-full" />
    </div>
  )
}
