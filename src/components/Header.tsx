import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Home, Code2, Image as ImageIcon, Timer, Menu, X } from 'lucide-react'
import { CONTEST_DEADLINE, CONTEST_NAME, SCHOOL_NAME } from '@/constants'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(deadline: string): TimeLeft {
  const target = new Date(deadline).getTime()
  const now = Date.now()
  const diff = target - now

  if (Number.isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

type NavLinkClassArgs = {
  isActive: boolean
}

function Header() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(CONTEST_DEADLINE))
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft(CONTEST_DEADLINE))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const desktopNavLinkClass = ({ isActive }: NavLinkClassArgs): string =>
    [
      'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap',
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
    ].join(' ')

  const mobileNavLinkClass = ({ isActive }: NavLinkClassArgs): string =>
    [
      'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-colors duration-200',
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50',
    ].join(' ')

  const days = String(timeLeft.days).padStart(2, '0')
  const hours = String(timeLeft.hours).padStart(2, '0')
  const minutes = String(timeLeft.minutes).padStart(2, '0')

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="gz_logo.png"
              alt="School Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">{SCHOOL_NAME}</p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">{CONTEST_NAME}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={desktopNavLinkClass} end>
              <Home className="h-4 w-4" />
              <span>首页</span>
            </NavLink>
            <NavLink to="/programming" className={desktopNavLinkClass}>
              <Code2 className="h-4 w-4" />
              <span>图形化编程</span>
            </NavLink>
            <NavLink to="/aigc" className={desktopNavLinkClass}>
              <ImageIcon className="h-4 w-4" />
              <span>AIGC 创意</span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 border-l border-slate-200 pl-6 md:flex">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                距离截止
              </p>
              <p className="font-mono text-sm font-medium tabular-nums text-slate-700">
                {days}天 {hours}时 {minutes}分
              </p>
            </div>
            <div className="rounded-full bg-slate-100 p-1.5">
              <Timer className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-lg p-2 text-slate-600 transition-colors active:scale-95 hover:bg-slate-100 md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="切换菜单"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-[max-height,opacity] duration-200 ease-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden border-b border-slate-200 bg-white shadow-sm`}
      >
        <div className="flex flex-col gap-2 p-4">
          <NavLink
            to="/"
            className={mobileNavLinkClass}
            onClick={() => setIsMenuOpen(false)}
            end
          >
            <Home className="h-5 w-5" />
            <span>首页</span>
          </NavLink>
          <NavLink
            to="/programming"
            className={mobileNavLinkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            <Code2 className="h-5 w-5" />
            <span>图形化编程</span>
          </NavLink>
          <NavLink
            to="/aigc"
            className={mobileNavLinkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            <ImageIcon className="h-5 w-5" />
            <span>AIGC 创意</span>
          </NavLink>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              截止倒计时
            </span>
            <div className="flex items-center gap-2 font-mono text-sm font-medium tabular-nums text-slate-700">
              <span>
                {days}天 {hours}时
              </span>
              <Timer className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
