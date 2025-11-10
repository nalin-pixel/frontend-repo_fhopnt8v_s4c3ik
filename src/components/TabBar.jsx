import { X, FileCode2, Save } from 'lucide-react'

export default function TabBar({ tabs, activeId, onSelect, onClose, onSave }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-t border-t-2 ${
            activeId === tab.id ? 'border-blue-500 bg-zinc-50 text-zinc-900' : 'border-transparent text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <FileCode2 size={16} className="text-blue-500" />
          <span className="truncate max-w-[160px]">{tab.name}</span>
          <span className="text-xs text-zinc-400">{tab.dirty ? '●' : ''}</span>
          <X
            size={14}
            className="ml-1 text-zinc-400 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onClose(tab.id)
            }}
          />
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2 py-1">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  )
}
