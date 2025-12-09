function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm font-medium text-slate-400">
            © 2025 李初一 · 比赛投稿门户
          </p>
          <div className="flex flex-col items-center gap-2 text-xs text-slate-400 md:flex-row md:gap-6 md:text-right">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-600"
            >
              粤ICP备2025442877号-1
            </a>
            <a
              href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44200102445696"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-slate-600"
            >
              <img
                src="icon.png"
                alt="备案图标"
                className="h-4 w-4 object-contain"
              />
              <span>粤公网安备44200102445696号</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
