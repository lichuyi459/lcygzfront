import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Image as ImageIcon } from 'lucide-react'
import OpeningAnimation from '@/components/home/OpeningAnimation'
import { CONTEST_NAME } from '@/constants'

function HomePage() {
  const [introFinished, setIntroFinished] = useState(false)

  return (
    <>
      {!introFinished && <OpeningAnimation onComplete={() => setIntroFinished(true)} />}
      <div
        className={`relative z-10 flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-12 font-sans text-slate-800 sm:px-6 lg:px-8 ${
          introFinished ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-50 to-slate-50" />
          <div className="absolute inset-0 bg-dot-pattern opacity-70" />
        </div>

        <section className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            {CONTEST_NAME}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
            用代码构建世界，用 AI 描绘未来。
            <br />
            选择参加的赛项，开始挑战吧！
          </p>
        </section>

        <section className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Link
              to="/programming"
              className="group relative block h-full rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <Code2 size={28} strokeWidth={2} />
                </div>
                <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  热门赛道
                </div>
              </div>

              <h2 className="mb-3 text-2xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                图形化编程
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-slate-500">
                使用 Scratch 或 Python 创作你的互动游戏、动画或工具。
              </p>

              <div className="mt-auto flex items-center font-bold text-slate-400 transition-colors group-hover:text-blue-600">
                <span>立即投稿</span>
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>

          <div>
            <Link
              to="/aigc"
              className="group relative block h-full rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors duration-300 group-hover:bg-purple-600 group-hover:text-white">
                  <ImageIcon size={28} strokeWidth={2} />
                </div>
                <div className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  新赛道
                </div>
              </div>

              <h2 className="mb-3 text-2xl font-bold text-slate-900 transition-colors group-hover:text-purple-600">
                AIGC 创意
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-slate-500">
                利用人工智能工具生成的绘画、视频或多媒体作品。
              </p>

              <div className="mt-auto flex items-center font-bold text-slate-400 transition-colors group-hover:text-purple-600">
                <span>立即投稿</span>
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>
        </section>

        <div className="mt-16 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-500 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span>温馨提示：截止日期前均可修改提交内容</span>
        </div>
      </div>
    </>
  )
}

export default HomePage
