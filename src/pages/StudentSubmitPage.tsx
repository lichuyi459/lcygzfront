import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
  Upload,
} from 'lucide-react'
import type { Category } from '@/types'
import { ALLOWED_EXTENSIONS, CATEGORY_LABELS } from '@/types'
import { ApiError, checkDailySubmission, createSubmission } from '@/api-client'

interface SelectOption {
  value: number
  label: string
}

const GRADE_OPTIONS: SelectOption[] = [
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
  { value: 3, label: '三年级' },
  { value: 4, label: '四年级' },
  { value: 5, label: '五年级' },
  { value: 6, label: '六年级' },
]

const CLASS_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_unused, index) => ({
  value: index + 1,
  label: `${String(index + 1).padStart(2, '0')} 班`,
}))

type ThemeTone = 'blue' | 'purple'

interface CustomSelectProps {
  value: number | ''
  onChange: (value: number) => void
  options: SelectOption[]
  placeholder: string
  tone: ThemeTone
}

function CustomSelect({ value, onChange, options, placeholder, tone }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (containerRef.current === null) {
        return
      }

      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!containerRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const selected = options.find((option) => option.value === value)

  const activeBorderClass =
    tone === 'blue' ? 'border-blue-600 ring-blue-600' : 'border-purple-600 ring-purple-600'
  const activeIconClass = tone === 'blue' ? 'text-blue-600' : 'text-purple-600'
  const activeOptionBg = tone === 'blue' ? 'bg-blue-600' : 'bg-purple-600'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all duration-200 ${
          open ? `${activeBorderClass} ring-1` : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        <span className={value === '' ? 'text-slate-400' : 'font-medium text-slate-900'}>
          {selected?.label ?? placeholder}
        </span>
        <ArrowRight
          size={16}
          className={`ml-2 shrink-0 rotate-90 text-slate-400 transition-transform duration-200 ${
            open ? `-rotate-90 ${activeIconClass}` : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? `${activeOptionBg} font-medium text-white`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

type SubmitStep = 'form' | 'submitting' | 'success'

interface StudentSubmitPageProps {
  targetCategory: Category
}

function StudentSubmitPage({ targetCategory }: StudentSubmitPageProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<SubmitStep>('form')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [studentName, setStudentName] = useState('')
  const [grade, setGrade] = useState<number | ''>('')
  const [classNumber, setClassNumber] = useState<number | ''>('')
  const [workTitle, setWorkTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isProgramming = targetCategory === 'PROGRAMMING'
  const tone: ThemeTone = isProgramming ? 'blue' : 'purple'

  const accentTextClass = isProgramming ? 'text-blue-600' : 'text-purple-600'
  const accentSoftBgClass = isProgramming ? 'bg-blue-50' : 'bg-purple-50'
  const buttonClass = isProgramming
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-purple-600 hover:bg-purple-700'
  const focusRingClass = isProgramming
    ? 'focus:border-blue-600 focus:ring-blue-100'
    : 'focus:border-purple-600 focus:ring-purple-100'

  const allowedExtensions = ALLOWED_EXTENSIONS[targetCategory]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile === undefined) {
      return
    }

    const lastDotIndex = selectedFile.name.lastIndexOf('.')

    if (lastDotIndex === -1) {
      setErrorMessage(`格式错误：支持的格式为 ${allowedExtensions.join(', ')}`)
      setFile(null)
      return
    }

    const extension = selectedFile.name.slice(lastDotIndex).toLowerCase()

    if (!allowedExtensions.includes(extension)) {
      setErrorMessage(`格式错误：支持的格式为 ${allowedExtensions.join(', ')}`)
      setFile(null)
      return
    }

    setFile(selectedFile)
    setErrorMessage(null)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (studentName.trim() === '' || workTitle.trim() === '' || grade === '' || classNumber === '') {
      setErrorMessage('请填写所有必填项（姓名、年级、班级、作品名称）')
      return
    }

    if (file === null) {
      setErrorMessage('请先上传作品文件')
      return
    }

    setStep('submitting')
    setErrorMessage(null)

    try {
      const quota = await checkDailySubmission(studentName.trim())

      if (!quota.canSubmit) {
        setErrorMessage('您今天已经提交过作品了，请明天再试。')
        setStep('form')
        return
      }

      await createSubmission({
        studentName: studentName.trim(),
        grade: Number(grade),
        classNumber: Number(classNumber),
        category: targetCategory,
        workTitle: workTitle.trim(),
        file,
      })

      setStep('success')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('提交过程中发生错误，请稍后重试')
      }
      setStep('form')
    }
  }

  const handleResetToHome = () => {
    navigate('/', { replace: true })
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 bg-dot-pattern px-4 py-12">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${accentSoftBgClass}`}
          >
            <CheckCircle2 size={32} className={accentTextClass} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">提交成功！</h2>
          <p className="mb-8 text-sm text-slate-500">
            太棒了，{studentName}同学！
            <br />
            你的
            <span className={`mx-1 font-medium ${accentTextClass}`}>
              {CATEGORY_LABELS[targetCategory]}
            </span>
            作品已收到。
          </p>

          <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-400">作品</span>
              <span className="max-w-[150px] truncate font-medium text-slate-900">
                {workTitle}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-2">
              <span className="text-slate-400">文件</span>
              <span className="max-w-[150px] truncate font-medium text-slate-900">{file?.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">时间</span>
              <span className="font-medium text-slate-900">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToHome}
            className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-medium text-white transition-all ${buttonClass}`}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50 bg-dot-pattern px-4 pb-12 pt-10">
      <main className="mx-auto w-full max-w-3xl">
        {errorMessage !== null && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-white p-4 text-slate-800 shadow-sm">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
            <div className="text-sm font-medium">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-slate-400 transition-colors hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="space-y-10 p-8">
            <section className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center rounded-xl border border-transparent p-3 ${accentSoftBgClass} ${accentTextClass}`}
              >
                {isProgramming ? <Cpu size={28} strokeWidth={1.5} /> : <Sparkles size={28} strokeWidth={1.5} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {CATEGORY_LABELS[targetCategory]}作品提交
                </h2>
                <p className="mt-1 text-sm text-slate-400">请填写信息并上传你的杰作</p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  01 / 身份信息
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="mb-2 ml-1 block text-sm font-medium text-slate-700">姓名</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(event) => setStudentName(event.target.value)}
                    placeholder="请输入你的真实姓名"
                    className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-300 hover:border-slate-400 focus:ring-1 ${focusRingClass}`}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 ml-1 block text-sm font-medium text-slate-700">
                      年级
                    </label>
                    <CustomSelect
                      value={grade}
                      onChange={setGrade}
                      options={GRADE_OPTIONS}
                      placeholder="选择年级"
                      tone={tone}
                    />
                  </div>
                  <div>
                    <label className="mb-2 ml-1 block text-sm font-medium text-slate-700">
                      班级
                    </label>
                    <CustomSelect
                      value={classNumber}
                      onChange={setClassNumber}
                      options={CLASS_OPTIONS}
                      placeholder="选择班级"
                      tone={tone}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  02 / 作品信息
                </h3>
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-medium text-slate-700">
                  作品名称
                </label>
                <div className="relative">
                  <Pencil
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={workTitle}
                    onChange={(event) => setWorkTitle(event.target.value)}
                    placeholder="给你的作品起个好听的名字"
                    maxLength={50}
                    className={`w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-300 hover:border-slate-400 focus:ring-1 ${focusRingClass}`}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  03 / 上传文件
                </h3>
              </div>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={allowedExtensions.join(',')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center transition-all duration-300 ${
                    file === null
                      ? 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                      : isProgramming
                        ? 'border-blue-500 bg-blue-50/30'
                        : 'border-purple-500 bg-purple-50/30'
                  }`}
                >
                  {file === null ? (
                    <div className="flex flex-col items-center">
                      <div
                        className={`mb-4 rounded-full p-4 transition-transform duration-300 ${
                          accentSoftBgClass
                        } ${accentTextClass}`}
                      >
                        <Upload size={24} />
                      </div>
                      <p className="text-lg font-bold text-slate-700">点击上传作品</p>
                      <p className="mt-2 text-sm text-slate-400">
                        支持格式: {allowedExtensions.join(' , ')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <FileText size={28} className={accentTextClass} />
                      </div>
                      <p className="text-lg font-bold text-slate-800">{file.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <span
                        className={`mt-4 rounded-full border bg-white px-3 py-1 text-xs font-bold ${accentTextClass} ${
                          isProgramming ? 'border-blue-100' : 'border-purple-100'
                        }`}
                      >
                        已准备就绪
                      </span>
                    </div>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                温馨提示：作品提交成功后，若在截止日期前需要更新内容，可以再次提交，系统会以当天最后一次提交为准。
              </p>
            </section>
          </div>

          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-8 py-6">
            <button
              type="submit"
              disabled={step === 'submitting'}
              className={`inline-flex w-full items-center justify-center rounded-xl px-12 py-3 text-lg font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${buttonClass}`}
            >
              {step === 'submitting' && <Loader2 className="mr-2 animate-spin" size={20} />}
              {step === 'submitting' ? '正在提交...' : '确认提交'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export function ProgrammingSubmitPage() {
  return <StudentSubmitPage targetCategory="PROGRAMMING" />
}

export function AigcSubmitPage() {
  return <StudentSubmitPage targetCategory="AIGC" />
}

export default StudentSubmitPage
