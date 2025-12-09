import { useEffect, useState } from 'react'

type OpeningPhase = 'idle' | 'dropping' | 'reading' | 'success' | 'exit'

interface OpeningAnimationProps {
  onComplete: () => void
}

function OpeningAnimation({ onComplete }: OpeningAnimationProps) {
  const [phase, setPhase] = useState<OpeningPhase>('idle')

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('dropping'), 800)
    const t2 = window.setTimeout(() => setPhase('reading'), 1500)
    const t3 = window.setTimeout(() => setPhase('success'), 3500)
    const t4 = window.setTimeout(() => setPhase('exit'), 4500)
    const t5 = window.setTimeout(onComplete, 5200)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      window.clearTimeout(t5)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-1000 ${
        phase === 'exit' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <style>{`
        @keyframes cartridge-drop {
          0% { transform: translateY(-180px); }
          60% { transform: translateY(15px); }
          80% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes impact-shake {
          0% { transform: translateY(0); }
          25% { transform: translateY(8px); }
          50% { transform: translateY(-5px); }
          75% { transform: translateY(3px); }
          100% { transform: translateY(0); }
        }
        @keyframes expand-light {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(50); opacity: 0; }
        }
        @keyframes blink-red {
          0%, 100% { background-color: #7f1d1d; box-shadow: none; }
          50% { background-color: #ef4444; box-shadow: 0 0 10px #ef4444; }
        }
      `}</style>

      <div className="relative flex h-80 w-96 items-end justify-center">
        <div className="absolute bottom-0 flex h-28 w-72 justify-center overflow-hidden rounded-t-lg border-t border-slate-700 bg-slate-800">
          <div className="h-full w-44 bg-slate-950/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]" />
        </div>

        <div className="absolute bottom-[24px] z-10">
          <div
            style={{
              animation:
                phase !== 'idle'
                  ? 'cartridge-drop 0.7s cubic-bezier(0.6, 0.05, 0.2, 1) forwards'
                  : 'none',
              transform: 'translateY(-220px)',
            }}
            className="relative h-52 w-40"
          >
            <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-t-lg border-x-[4px] border-t-[4px] border-indigo-600 bg-indigo-700 shadow-2xl">
              <div className="flex h-6 w-full items-center justify-center gap-2 border-b border-indigo-900/50 bg-indigo-800/30">
                <div className="h-0.5 w-32 bg-indigo-900/40" />
                <div className="h-0.5 w-32 bg-indigo-900/40" />
              </div>

              <div className="relative flex h-full w-full flex-1 p-3">
                <div className="absolute left-0 top-10 h-24 w-1.5 rounded-r-sm bg-indigo-900/40" />
                <div className="absolute right-0 top-10 h-24 w-1.5 rounded-l-sm bg-indigo-900/40" />

                <div className="flex h-full w-full flex-col rounded-md bg-indigo-800 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-sm bg-slate-50 shadow-sm">
                    <div className="mb-1 flex h-6 w-full items-center justify-between bg-indigo-600 px-2">
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="text-[8px] font-bold tracking-widest text-white/80">
                        LCYLCY
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center px-2 pb-2 text-center">
                      <span className="mb-1 w-full border-b border-slate-200 pb-1 text-xs font-black tracking-widest text-slate-400">
                        蛋仔派对
                      </span>
                      <span className="my-1 text-2xl font-black leading-none tracking-tighter text-indigo-800">
                        逃出
                        <br />
                        惊魂夜
                      </span>
                      <div className="mt-auto flex w-full items-end justify-between">
                        <span className="rounded-sm bg-slate-900 px-1.5 text-[9px] font-bold text-white">
                          2025
                        </span>
                        <div className="flex gap-0.5">
                          <div className="h-3 w-1 skew-x-12 bg-red-500" />
                          <div className="h-3 w-1 skew-x-12 bg-blue-500" />
                          <div className="h-3 w-1 skew-x-12 bg-yellow-500" />
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/30 to-transparent" />
                  </div>
                </div>
              </div>

              <div className="mb-1 flex h-3 w-32 items-end justify-center gap-1 rounded-sm bg-black/40 px-2 pb-0.5">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className="h-2 w-1.5 rounded-b-[1px] bg-yellow-500 shadow-[0_0_2px_rgba(234,179,8,0.8)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative z-20 flex h-24 w-80 flex-col items-center justify-start overflow-hidden rounded-t-lg border-t border-slate-600 bg-slate-800 pt-0 shadow-2xl"
          style={{
            animation: phase === 'dropping' ? 'impact-shake 0.4s ease-out 0.5s' : 'none',
          }}
        >
          <div className="mb-2 h-4 w-48 rounded-b-xl border-b border-slate-700 bg-slate-900 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.6)]">
            <div className="h-full w-full origin-top bg-slate-800/80" />
          </div>

          <div className="mt-2 flex w-full items-center justify-between px-6 opacity-80">
            <div className="flex flex-col gap-1.5">
              <div className="h-1 w-14 rounded-full border-b border-slate-700 bg-slate-950" />
              <div className="h-1 w-14 rounded-full border-b border-slate-700 bg-slate-950" />
              <div className="h-1 w-14 rounded-full border-b border-slate-700 bg-slate-950" />
            </div>

            <div className="font-mono text-[10px] font-bold tracking-[2px] text-slate-400 opacity-60">
              SYSTEM CONSOLE
            </div>

            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-700 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]">
              <div className="h-px w-2 rotate-45 bg-slate-900" />
              <div className="absolute h-px w-2 -rotate-45 bg-slate-900" />
            </div>
          </div>

          <div className="mt-auto flex h-6 w-full items-center justify-between border-t border-slate-950 bg-slate-900 px-3 shadow-inner">
            <div className="flex h-full w-20 overflow-hidden opacity-60">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="h-full w-2.5 skew-x-[30deg] border-r border-black/30 bg-yellow-600"
                />
              ))}
            </div>

            <div className="flex items-center gap-4 pr-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                    phase === 'reading' || phase === 'success' || phase === 'exit'
                      ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                      : 'bg-red-900'
                  }`}
                />
                <span className="origin-left scale-90 text-[9px] font-bold text-slate-500">
                  电源
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-100 ${
                    phase === 'reading'
                      ? 'animate-[blink-red_0.1s_infinite]'
                      : phase === 'success' || phase === 'exit'
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                        : 'bg-slate-900'
                  }`}
                />
                <span className="origin-left scale-90 text-[9px] font-bold text-slate-500">
                  数据
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 h-6 font-mono text-sm tracking-widest text-slate-500">
        {phase === 'reading' && (
          <span className="animate-pulse text-amber-500">加载数据中...</span>
        )}
        {(phase === 'success' || phase === 'exit') && (
          <span className="font-bold text-green-500 transition-all duration-300">
            系统准备就绪
          </span>
        )}
      </div>

      {phase === 'exit' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-10 w-10 animate-[expand-light_1.2s_cubic-bezier(0.5,0,0.5,1)_forwards] rounded-full bg-white" />
        </div>
      )}
    </div>
  )
}

export default OpeningAnimation

