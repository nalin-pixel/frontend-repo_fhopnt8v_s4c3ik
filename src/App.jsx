import { useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import TabBar from './components/TabBar'
import StatusBar from './components/StatusBar'

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
    ],
  },
]

const initialFiles = {
  '/src/main.js': `export function greet(name){\n  return 'Hello, ' + name + '!';\n}\n\nconsole.log(greet('World'));`,
  '/src/utils.js': `export const sum = (a,b) => a + b;\nexport const mul = (a,b) => a * b;`,
  '/src/components/Button.jsx': `export default function Button({children}){\n  return <button style={{padding:'8px 12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6}}>{children}</button>\n}`,
  '/src/components/Header.jsx': `export default function Header(){\n  return <header style={{padding:16, fontWeight:700}}>My App</header>\n}`,
  '/public/index.html': `<!doctype html>\n<html><head><title>App</title></head><body><div id='root'></div></body></html>`,
}

export default function App() {
  const [tree] = useState(initialTree)
  const [files, setFiles] = useState(initialFiles)
  const [tabs, setTabs] = useState([])
  const [activeId, setActiveId] = useState(null)

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeId), [tabs, activeId])
  const activeContent = activeTab ? files[activeTab.path] ?? '' : ''

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

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-100">
      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-4">
        <div className="font-semibold">VS Code Lite</div>
        <div className="text-sm text-zinc-500">A minimal in-browser editor</div>
      </div>

      {/* Main area */}
      <div className="flex-1 grid grid-cols-[16rem_1fr]">
        <Sidebar tree={tree} onOpenFile={openFile} />
        <div className="flex flex-col min-w-0">
          <TabBar
            tabs={tabs}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeTab}
            onSave={saveActive}
          />
          <div className="flex-1 p-3">
            {activeTab ? (
              <Editor value={activeContent} onChange={updateActiveContent} />
            ) : (
              <div className="h-full rounded-md border border-dashed border-zinc-300 bg-white flex items-center justify-center text-zinc-500">
                Open a file from the explorer to start editing
              </div>
            )}
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  )
}
