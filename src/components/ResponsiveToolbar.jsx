import { DeviceMobile, Monitor, SplitSquareVertical, Columns2, LayoutDashboard } from 'lucide-react'

export default function ResponsiveToolbar({ size, onSizeChange, onSplit }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSizeChange('mobile')}
        className={`px-2 py-1 rounded text-xs ${size==='mobile'?'bg-blue-600 text-white':'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}
        title="Mobile"
      >
        <DeviceMobile size={14} />
      </button>
      <button
        onClick={() => onSizeChange('desktop')}
        className={`px-2 py-1 rounded text-xs ${size==='desktop'?'bg-blue-600 text-white':'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}
        title="Desktop"
      >
        <Monitor size={14} />
      </button>
      <div className="w-px h-5 bg-zinc-300 mx-1" />
      <button
        onClick={() => onSplit('vertical')}
        className="px-2 py-1 rounded text-xs bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
        title="Split Vertically"
      >
        <Columns2 size={14} />
      </button>
      <button
        onClick={() => onSplit('grid')}
        className="px-2 py-1 rounded text-xs bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
        title="Grid"
      >
        <LayoutDashboard size={14} />
      </button>
    </div>
  )
}
