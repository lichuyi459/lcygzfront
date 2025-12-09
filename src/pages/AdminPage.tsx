import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckSquare,
  Download,
  FileBarChart,
  Info,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Package,
  PieChart,
  Search,
  Square,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
} from 'lucide-react'
import JSZip from 'jszip'
import type { StudentSubmission, SortConfig } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { ApiError, downloadSubmissionFile, getFinalSubmissions, getSubmissions, login } from '@/api-client'

type ViewMode = 'all' | 'final'

const ADMIN_TOKEN_KEY = 'adminToken'

interface AdminStats {
  total: number
  today: number
}

function getInitialToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(ADMIN_TOKEN_KEY)
  return stored ?? null
}

function saveToken(token: string): void {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

function clearToken(): void {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY)
}

function generateDownloadName(submission: StudentSubmission): string {
  const original = submission.fileName
  const lastDot = original.lastIndexOf('.')
  const ext = lastDot === -1 ? '' : original.slice(lastDot)
  const paddedClass = String(submission.classNumber).padStart(2, '0')
  const safeTitle = submission.workTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 20)
  return `${submission.grade}年级_${paddedClass}班_${submission.studentName}_${safeTitle}${ext}`
}

interface LoginViewProps {
  password: string
  errorMessage: string | null
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function LoginView({ password, errorMessage, onPasswordChange, onSubmit }: LoginViewProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 bg-dot-pattern px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <Lock className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">管理员登录</h1>
          <p className="mt-1 text-sm text-slate-500">请输入访问密码</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          {errorMessage !== null && (
            <p className="rounded-lg bg-red-50 py-2 text-center text-sm text-red-500">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-indigo-700"
          >
            解锁进入
          </button>
        </form>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  stats: AdminStats
  viewMode: ViewMode
}

function StatsCards({ stats, viewMode }: StatsCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <div className="mb-1 text-sm font-medium text-slate-500">
            {viewMode === 'final' ? '最终有效作品数' : '总提交人次'}
          </div>
          <div className="text-4xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-blue-600">
          <FileBarChart size={32} />
        </div>
      </div>
      <div className="relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <div className="mb-1 text-sm font-medium text-slate-500">今日新增</div>
          <div className="text-4xl font-bold text-green-600">+{stats.today}</div>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-green-600">
          <Users size={32} />
        </div>
      </div>
    </div>
  )
}

interface ViewToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          viewMode === 'all'
            ? 'bg-slate-800 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <Layers size={16} />
        全部提交记录
      </button>
      <button
        type="button"
        onClick={() => onChange('final')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          viewMode === 'final'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <Filter size={16} />
        最终作品（去重）
      </button>
    </div>
  )
}

interface ToolbarProps {
  viewMode: ViewMode
  selectedCount: number
  isZipping: boolean
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onBatchDownload: () => void
}

function Toolbar({
  viewMode,
  selectedCount,
  isZipping,
  searchTerm,
  onSearchTermChange,
  onBatchDownload,
}: ToolbarProps) {
  const hasSelection = selectedCount > 0

  return (
    <div className="mb-6 flex h-12 flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex w-full flex-1 items-center gap-4">
        {hasSelection ? (
          <div className="flex w-full items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm text-indigo-900 sm:w-auto">
            <span className="whitespace-nowrap font-bold">已选中 {selectedCount} 项</span>
            <span className="h-4 w-px bg-indigo-200" />
            <button
              type="button"
              onClick={onBatchDownload}
              disabled={isZipping}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isZipping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Package size={16} />
              )}
              {isZipping ? '打包中...' : '批量下载（ZIP）'}
            </button>
          </div>
        ) : (
          <h2 className="self-start text-lg font-bold text-slate-800 sm:self-center">
            {viewMode === 'final' ? '最终作品列表' : '所有提交历史'}
          </h2>
        )}
      </div>

      <div className="group relative w-full sm:w-80">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="搜索姓名或班级..."
          className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
    </div>
  )
}

interface SubmissionsTableProps {
  rows: StudentSubmission[]
  sortConfig: SortConfig
  selectedIds: Set<string>
  onSortChange: (key: SortConfig['key']) => void
  onToggleAll: () => void
  onToggleOne: (id: string) => void
  onDownload: (submission: StudentSubmission) => void
}

const TABLE_HEADERS: Partial<Record<keyof StudentSubmission, string>> = {
  studentName: '姓名',
  grade: '年级',
  classNumber: '班级',
  category: '参赛类别',
  workTitle: '作品名称',
  submittedAt: '提交时间',
}

const TABLE_COLUMNS: (keyof StudentSubmission)[] = [
  'studentName',
  'grade',
  'classNumber',
  'category',
  'workTitle',
  'submittedAt',
]

function SubmissionsTable({
  rows,
  sortConfig,
  selectedIds,
  onSortChange,
  onToggleAll,
  onToggleOne,
  onDownload,
}: SubmissionsTableProps) {
  const isAllSelected = rows.length > 0 && rows.every((item) => selectedIds.has(item.id))
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected

  return (
    <div className="min-h-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-4">
                <button
                  type="button"
                  onClick={onToggleAll}
                  className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-600"
                >
                  {isAllSelected ? (
                    <CheckSquare size={20} className="text-indigo-600" />
                  ) : isSomeSelected ? (
                    <span className="relative">
                      <Square size={20} />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-indigo-600" />
                      </span>
                    </span>
                  ) : (
                    <Square size={20} />
                  )}
                </button>
              </th>
              {TABLE_COLUMNS.map((key) => (
                <th
                  key={key}
                  className="whitespace-nowrap px-6 py-4 cursor-pointer select-none font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  onClick={() => onSortChange(key)}
                >
                  <span className="flex items-center gap-2">
                    {TABLE_HEADERS[key]}
                    {sortConfig.key === key &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUp size={14} className="text-indigo-500" />
                      ) : (
                        <ChevronDown size={14} className="text-indigo-500" />
                      ))}
                  </span>
                </th>
              ))}
              <th className="px-6 py-4 text-right font-semibold text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((submission) => {
                const isSelected = selectedIds.has(submission.id)
                const isProgramming = submission.category === 'PROGRAMMING'

                return (
                  <tr
                    key={submission.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onToggleOne(submission.id)}
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-indigo-600" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {submission.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{submission.grade}年级</td>
                    <td className="px-6 py-4 text-slate-600">{submission.classNumber}班</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isProgramming
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {CATEGORY_LABELS[submission.category]}
                      </span>
                    </td>
                    <td
                      className="max-w-[160px] truncate px-6 py-4 text-slate-600"
                      title={submission.workTitle}
                    >
                      {submission.workTitle}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDownload(submission)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-800"
                      >
                        <Download size={14} />
                        下载
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 2} className="px-6 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <PieChart size={40} className="text-slate-200" />
                    <p>没有找到相关记录</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminPage() {
  const [token, setToken] = useState<string | null>(() => getInitialToken())
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'submittedAt',
    direction: 'desc',
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isZipping, setIsZipping] = useState(false)

  const isAuthenticated = token !== null

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchData = async () => {
      setIsLoadingData(true)
      setSelectedIds(new Set())

      try {
        const data =
          viewMode === 'final' ? await getFinalSubmissions(token) : await getSubmissions(token)
        setSubmissions(data)
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          clearToken()
          setToken(null)
        }
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [token, viewMode])

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const sorted = [...submissions].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    if (term === '') {
      return sorted
    }

    return sorted.filter((submission) => {
      const nameMatch = submission.studentName.toLowerCase().includes(term)
      const classMatch = String(submission.classNumber).includes(term)
      return nameMatch || classMatch
    })
  }, [submissions, searchTerm, sortConfig])

  const stats: AdminStats = useMemo(() => {
    const total = submissions.length
    const todayLabel = new Date().toDateString()
    const today = submissions.filter(
      (submission) => new Date(submission.submittedAt).toDateString() === todayLabel,
    ).length
    return { total, today }
  }, [submissions])

  const handleLoginSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setLoginError(null)

    try {
      const result = await login({ password })
      saveToken(result.access_token)
      setToken(result.access_token)
      setPassword('')
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setLoginError('密码错误或服务不可用')
      } else if (error instanceof Error) {
        setLoginError(error.message)
      } else {
        setLoginError('登录失败，请稍后重试')
      }
    }
  }

  const handleLogout = () => {
    clearToken()
    setToken(null)
    setPassword('')
    setSubmissions([])
    setSelectedIds(new Set())
    setSearchTerm('')
  }

  const handleSortChange = (key: SortConfig['key']) => {
    setSortConfig((current) => {
      if (current.key === key) {
        const direction = current.direction === 'asc' ? 'desc' : 'asc'
        return { key, direction }
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleSelectAll = () => {
    if (filteredRows.length === 0) {
      return
    }

    const allSelected = filteredRows.every((row) => selectedIds.has(row.id))
    const next = new Set(selectedIds)

    if (allSelected) {
      filteredRows.forEach((row) => next.delete(row.id))
    } else {
      filteredRows.forEach((row) => next.add(row.id))
    }

    setSelectedIds(next)
  }

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleSingleDownload = async (submission: StudentSubmission) => {
    if (!token) {
      return
    }

    try {
      const blob = await downloadSubmissionFile(submission.id, token)
      const fileName = generateDownloadName(submission)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      // eslint-disable-next-line no-alert
      alert('下载失败，请稍后重试')
    }
  }

  const handleBatchDownload = async () => {
    if (!token || selectedIds.size === 0) {
      return
    }

    setIsZipping(true)

    try {
      const zip = new JSZip()
      const modeLabel = viewMode === 'final' ? '最终作品' : '全部提交'
      const folder = zip.folder(`2025图形化编程创意赛_${modeLabel}`)

      const selectedSubmissions = submissions.filter((submission) => selectedIds.has(submission.id))

      const downloads = selectedSubmissions.map(async (submission) => {
        try {
          const blob = await downloadSubmissionFile(submission.id, token)
          const fileName = generateDownloadName(submission)
          return { fileName, blob }
        } catch {
          return null
        }
      })

      const files = await Promise.all(downloads)

      files.forEach((file) => {
        if (file !== null) {
          folder?.file(file.fileName, file.blob)
        }
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const anchor = document.createElement('a')
      anchor.href = url
      const dateLabel = new Date().toISOString().split('T')[0] ?? 'download'
      const fileCount = files.filter((file) => file !== null).length
      anchor.download = `批量下载_${modeLabel}_${dateLabel}_${fileCount}个文件.zip`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      setSelectedIds(new Set())
    } catch {
      // eslint-disable-next-line no-alert
      alert('打包失败，请稍后重试')
    } finally {
      setIsZipping(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        password={password}
        errorMessage={loginError}
        onPasswordChange={setPassword}
        onSubmit={handleLoginSubmit}
      />
    )
  }

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">比赛管理后台</h1>
            <div className="text-xs text-slate-500">API 已连接</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <StatsCards stats={stats} viewMode={viewMode} />
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />

        {viewMode === 'final' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-indigo-900">
            <Info size={20} className="mt-0.5 shrink-0 text-indigo-600" />
            <p className="text-sm">
              <strong>已启用去重筛选：</strong>
              当前仅显示每个学生在每个赛项下的
              <span className="underline decoration-indigo-300 decoration-2 underline-offset-2">
                最后一次
              </span>
              提交，适合比赛截止后导出最终评审列表。
            </p>
          </div>
        )}

        <Toolbar
          viewMode={viewMode}
          selectedCount={selectedIds.size}
          isZipping={isZipping}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onBatchDownload={handleBatchDownload}
        />

        {isLoadingData ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p>加载数据中...</p>
          </div>
        ) : (
          <SubmissionsTable
            rows={filteredRows}
            sortConfig={sortConfig}
            selectedIds={selectedIds}
            onSortChange={handleSortChange}
            onToggleAll={toggleSelectAll}
            onToggleOne={toggleSelectOne}
            onDownload={handleSingleDownload}
          />
        )}
      </main>
    </div>
  )
}

export default AdminPage

