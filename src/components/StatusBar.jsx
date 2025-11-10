import { Wifi, HardDrive, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function StatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-8 bg-zinc-900 text-zinc-300 text-xs flex items-center px-3 gap-4">
      <div className="flex items-center gap-1.5">
        <Wifi size={14} className="text-emerald-400" />
        <span>Connected</span>
      </div>
      <div className="flex items-center gap-1.5">
        <HardDrive size={14} className="text-blue-400" />
        <span>Local workspace</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Clock size={14} />
        <span>{time.toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
