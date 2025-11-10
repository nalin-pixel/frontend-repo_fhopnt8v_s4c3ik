import { useState } from 'react'
import { Files, Folder, File, ChevronRight, ChevronDown, Plus, Search } from 'lucide-react'

function TreeItem({ node, level = 0, onOpen }) {
  const [expanded, setExpanded] = useState(true)
  const isFolder = !!node.children

  const padding = 8 + level * 12

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-100`}
        style={{ paddingLeft: padding }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded)
          else onOpen(node)
        }}
      >
        {isFolder ? (
          expanded ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />
        ) : (
          <span className="w-4" />
        )}
        {isFolder ? (
          <Folder size={16} className="text-amber-500" />
        ) : (
          <File size={16} className="text-blue-500" />
        )}
        <span className="text-sm text-zinc-700 truncate">{node.name}</span>
      </div>
      {isFolder && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.path} node={child} level={level + 1} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ tree, onOpenFile }) {
  const [query, setQuery] = useState('')

  const filteredChildren = (nodes) => {
    if (!query.trim()) return nodes
    const q = query.toLowerCase()
    return nodes
      .map((n) => {
        if (n.children) {
          const kids = filteredChildren(n.children)
          if (kids.length) return { ...n, children: kids }
          if (n.name.toLowerCase().includes(q)) return { ...n }
          return null
        }
        return n.name.toLowerCase().includes(q) ? n : null
      })
      .filter(Boolean)
  }

  const root = { name: 'workspace', path: '/', children: filteredChildren(tree) }

  return (
    <aside className="h-full w-64 border-r border-zinc-200 bg-white flex flex-col">
      <div className="px-3 py-2 border-b border-zinc-200 flex items-center gap-2">
        <Files className="text-zinc-700" size={18} />
        <span className="font-medium text-sm">Explorer</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1 hover:bg-zinc-100 rounded" title="New">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="flex items-center gap-2 bg-zinc-100 rounded px-2 py-1.5">
          <Search size={16} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            className="bg-transparent outline-none text-sm w-full placeholder:text-zinc-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto px-1 pb-4">
        <TreeItem node={root} onOpen={onOpenFile} />
      </div>
    </aside>
  )
}
