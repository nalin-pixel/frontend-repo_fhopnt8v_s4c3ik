import { useMemo, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import TabBar from './components/TabBar'
import StatusBar from './components/StatusBar'
import Console from './components/Console'
import Preview from './components/Preview'
import { Menu, Play, Eye } from 'lucide-react'

// Sample in-memory file tree and files
const initialTree = [
  {
    name: 'src',
    path: '/src',
    children: [
      { name: 'main.js', path: '/src/main.js' },
      { name: 'utils.js', path: '/src/utils.js' },
      {
        name: 'components',
        path: '/src/components',
        children: [
          { name: 'Button.jsx', path: '/src/components/Button.jsx' },
          { name: 'Header.jsx', path: '/src/components/Header.jsx' },
        ],
      },
    ],
  },
  {
    name: 'public',
    path: '/public',
    children: [
      { name: 'index.html', path: '/public/index.html' },
      { name: 'styles.css', path: '/public/styles.css' },
    ],
  },
]

const initialFiles = {
  '/src/main.js': `import { sum } from './utils.js'\n\nfunction greet(name){\n  return 'Hello, ' + name + '!';\n}\n\nconsole.log(greet('World'))\nconsole.log('2 + 3 =', sum(2,3))`,
  '/src/utils.js': `export const sum = (a,b) => a + b;\nexport const mul = (a,b) => a * b;`,
  '/src/components/Button.jsx': `export default function Button({children}){\n  return <button style={{padding:'8px 12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6}}>{children}</button>\n}`,
  '/src/components/Header.jsx': `export default function Header(){\n  return <header style={{padding:16, fontWeight:700}}>My App</header>\n}`,
  '/public/index.html': `<!doctype html>\n<html>\n<head>\n  <meta charset='utf-8'/>\n  <meta name='viewport' content='width=device-width, initial-scale=1'/>\n  <title>Live Preview</title>\n</head>\n<body>\n  <div id='app'>Edit files to update this preview.</div>\n</body>\n</html>`,
  '/public/styles.css': `body{font-family:system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif; padding:16px;}\n#app{padding:12px;border:1px dashed #94a3b8;border-radius:8px;color:#0f172a}`,
}

export default function App() {
  const [tree] = useState(initialTree)
  const [files, setFiles] = useState(initialFiles)
  const [tabs, setTabs] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)

  // Console
  const [logs, setLogs] = useState([])
  const pushLog = useCallback((type, message) => {
    setLogs((prev) => [...prev, { type, message: String(message) }])
  }, [])
  const clearLogs = useCallback(() => setLogs([]), [])

  // Bottom panel: console or preview
  const [bottomTab, setBottomTab] = useState('console') // 'console' | 'preview'

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeId), [tabs, activeId])
  const activeContent = activeTab ? files[activeTab.path] ?? '' : ''

  const detectLanguage = (path) => {
    if (!path) return 'javascript'
    if (path.endsWith('.html')) return 'html'
    if (path.endsWith('.css')) return 'css'
    return 'javascript'
  }

  const openFile = (node) => {
    if (!files[node.path]) return
    const id = node.path
    setTabs((prev) => {
      if (prev.some((t) => t.id === id)) return prev
      return [...prev, { id, name: node.name, path: node.path, dirty: false }]
    })
    setActiveId(id)
  }

  const closeTab = (id) => {
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeId === id) {
      const idx = tabs.findIndex((t) => t.id === id)
      const next = tabs[idx - 1] || tabs[idx + 1]
      setActiveId(next ? next.id : null)
    }
  }

  const updateActiveContent = (v) => {
    if (!activeTab) return
    setFiles((prev) => ({ ...prev, [activeTab.path]: v }))
    setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, dirty: true } : t)))
  }

  const saveActive = () => {
    if (!activeTab) return
    setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, dirty: false } : t)))
  }

  // Run current JS file (very sandboxed eval) and capture output
  const runActive = () => {
    clearLogs()
    if (!activeTab) return
    const path = activeTab.path
    if (!/\.js$/.test(path)) {
      pushLog('warn', 'Run supports only .js files in this demo.')
      return
    }

    // very naive module resolver for /src/*.js imports
    const resolve = (p) => {
      // handle relative imports like './utils.js'
      if (p.startsWith('./')) {
        const base = path.split('/').slice(0, -1).join('/')
        const merged = base + '/' + p.slice(2)
        return merged
      }
      return p
    }

    const moduleCache = {}
    const requireLike = (p) => {
      const key = resolve(p)
      if (moduleCache[key]) return moduleCache[key]
      const code = files[key]
      const exports = {}
      if (code == null) throw new Error('Module not found: ' + key)
      const wrapped = `(function(exports){\n${code}\n;return exports;})`
      const fn = new Function('exports', wrapped)
      moduleCache[key] = fn(exports)
      return moduleCache[key]
    }

    const runCode = (code) => {
      const original = { ...console }
      try {
        console.log = (...a) => pushLog('log', a.join(' '))
        console.warn = (...a) => pushLog('warn', a.join(' '))
        console.error = (...a) => pushLog('error', a.join(' '))

        // support simple ES module style exports import by regex replace
        const transpiled = code
          .replace(/export const (\w+)\s*=\s*/g, 'var $1 = ')
          .replace(/export default /g, '')
          .replace(/import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?/g, (m, names, from) => {
            const mod = requireLike(from)
            return names
              .split(',')
              .map((n) => `var ${n.trim()} = (${JSON.stringify(mod)})['${n.trim()}'];`)
              .join('')
          })

        const f = new Function(transpiled)
        const result = f()
        if (result !== undefined) pushLog('log', String(result))
      } catch (e) {
        pushLog('error', e.message || String(e))
      } finally {
        console.log = original.log
        console.warn = original.warn
        console.error = original.error
      }
    }

    runCode(files[path])
  }

  // Build preview content from /public/index.html and optional styles + combining JS
  const previewData = useMemo(() => {
    const html = files['/public/index.html'] || ''
    const css = files['/public/styles.css'] || ''
    // Combine all /src/*.js into one bundle in naive order
    const jsParts = Object.entries(files)
      .filter(([p]) => p.startsWith('/src/') && p.endsWith('.js'))
      .map(([, c]) => c)
    const js = jsParts.join('\n\n')
    return { html, css, js }
  }, [files])

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-100">
      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-3 sm:px-4 gap-3">
        <button className="sm:hidden p-1.5 rounded hover:bg-zinc-100" onClick={() => setShowSidebar((v) => !v)} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <div className="font-semibold">VS Code Lite</div>
        <div className="hidden sm:block text-sm text-zinc-500">In-browser editor with Console, Preview, and highlighting</div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={runActive} className="inline-flex items-center gap-1.5 text-xs px-2 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            <Play size={14} /> Run
          </button>
          <button onClick={() => setBottomTab('preview')} className={`inline-flex items-center gap-1.5 text-xs px-2 py-1.5 rounded ${bottomTab==='preview'?'bg-blue-600 text-white':'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}>
            <Eye size={14} /> Preview
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className={`flex-1 grid ${showSidebar ? 'grid-cols-[16rem_1fr]' : 'grid-cols-1'}`}>
        {showSidebar && <Sidebar tree={tree} onOpenFile={openFile} />}
        <div className="flex flex-col min-w-0">
          <TabBar
            tabs={tabs}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeTab}
            onSave={saveActive}
          />
          <div className="flex-1 p-2 sm:p-3 grid grid-rows-[1fr_minmax(160px,36vh)] gap-2 sm:gap-3 min-h-0">
            <div className="min-h-0">
              {activeTab ? (
                <Editor value={activeContent} language={detectLanguage(activeTab.path)} onChange={updateActiveContent} />
              ) : (
                <div className="h-full rounded-md border border-dashed border-zinc-300 bg-white flex items-center justify-center text-zinc-500">
                  Open a file from the explorer to start editing
                </div>
              )}
            </div>
            <div className="min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <div className={`min-h-0 ${bottomTab==='console' ? '' : 'hidden md:block'}`}>
                <Console logs={logs} onClear={clearLogs} />
              </div>
              <div className={`min-h-0 ${bottomTab==='preview' ? '' : 'hidden md:block'}`}>
                <Preview html={previewData.html} css={previewData.css} js={previewData.js} onRefresh={() => setBottomTab('preview')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  )
}
