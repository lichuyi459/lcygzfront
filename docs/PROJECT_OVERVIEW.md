# 项目概览（lcygzfront）

## 技术栈与约束

- 架构：Vite + React + TypeScript
- UI：Tailwind CSS v4（通过 `@tailwindcss/vite` 集成）
- 路由：React Router（`BrowserRouter` + `Routes` / `Route` + `Link` / `NavLink`）
- 图标：`lucide-react`
- 压缩打包：`jszip`（管理员批量下载）
- Lint / TS 约束：
  - TypeScript `strict` 开启
  - ESLint（`typescript-eslint` + React Hooks 规则）
  - 不使用 `any` / `ts-ignore`

## 顶层结构

- `index.html`：挂载点 `#root`，入口脚本 `/src/main.tsx`
- `src/main.tsx`：
  - 使用 `StrictMode` 和 `BrowserRouter`
  - 渲染根组件 `<App />`
- `src/App.tsx`：
  - 全局布局容器（背景色 + 最小高度）
  - 使用 `useLocation()` 判断是否为 `/admin` 路由
    - 普通页面：渲染 `Header` + `Footer`
    - 管理后台：只渲染后台自己的头部，不复用公共 Header/Footer
  - 路由表：
    - `/` → `HomePage`
    - `/programming` → `ProgrammingSubmitPage`（学生编程作品提交页）
    - `/aigc` → `AigcSubmitPage`（学生 AIGC 作品提交页）
    - `/admin` → `AdminPage`（管理员后台）

## 基础配置与类型

### 环境常量（`src/constants.ts`）

- 通过 `import.meta.env` 读取 Vite 环境变量并提供默认值：
  - `API_BASE_URL`：默认 `http://localhost:3000`
  - `CONTEST_NAME`：默认 `2025图形化编程创意赛`
  - `SCHOOL_NAME`：默认 `中山市光正实验学校`
  - `CONTEST_DEADLINE`：默认 `2025-06-30T23:59:59.000Z`
- 所有常量显式标注为 `string`，满足严格 TS 配置。

### 领域类型（`src/types.ts`）

- `Category`：
  - 类型：`'PROGRAMMING' | 'AIGC'`
- `CATEGORY_LABELS: Record<Category, string>`：
  - `PROGRAMMING` → `图形化编程`
  - `AIGC` → `AIGC 创意`
- `StudentSubmission`：
  - 与后端 `Submission` 模型字段一一对应：
    - `id`, `studentName`, `grade`, `classNumber`, `category`, `workTitle`,
      `fileName`, `storedFileName`, `fileType`, `fileSize`, `submittedAt`
- `SortConfig`：
  - `{ key: keyof StudentSubmission; direction: 'asc' | 'desc' }`
- `ALLOWED_EXTENSIONS: Record<Category, string[]>`：
  - `PROGRAMMING`：`['.sb3', '.mp']`
  - `AIGC`：`['.png', '.jpg', '.jpeg']`

## API 客户端（`src/api-client.ts`）

与 `api.md` 描述的后端 HTTP API 强绑定的前端客户端，集中封装所有网络请求逻辑。

- 基础：
  - 使用 `fetch` + `API_BASE_URL`
  - 统一错误结构 `ApiErrorResponse` 与 `ApiError extends Error`
  - `extractErrorMessage()` 兼容后端可能返回的字符串 / 数组 / 对象 message 结构
- 类型：
  - `AuthToken = string`
  - `LoginRequest` / `LoginResponse`
  - `CheckSubmissionQuotaResponse`（`{ canSubmit: boolean }`）
  - `CreateSubmissionRequest`（对应投稿表单字段 + `File`）
- 封装的函数：
  - `login(payload: LoginRequest): Promise<LoginResponse>`
    - POST `/auth/login`
  - `createSubmission(payload: CreateSubmissionRequest): Promise<StudentSubmission>`
    - POST `/submissions`（`multipart/form-data`）
  - `getSubmissions(token: AuthToken): Promise<StudentSubmission[]>`
    - GET `/submissions`（管理员，需 Bearer Token）
  - `getFinalSubmissions(token: AuthToken): Promise<StudentSubmission[]>`
    - GET `/submissions/final`
  - `downloadSubmissionFile(id, token): Promise<Blob>`
    - GET `/submissions/:id/download`
  - `checkDailySubmission(studentName): Promise<CheckSubmissionQuotaResponse>`
    - GET `/submissions/check?studentName=...`
  - `getUploadUrl(storedFileName): string`
    - 静态上传路径 `/uploads/{storedFileName}`

## 公共 UI 组件

### 头部导航（`src/components/Header.tsx`）

- 基于 Tailwind 响应式布局的顶部导航：
  - 左侧：学校 Logo + 学校名称 + 比赛名称
  - 中间：桌面导航（`NavLink`）：
    - `/` → 首页
    - `/programming` → 图形化编程
    - `/aigc` → AIGC 创意
  - 右侧：报名截止倒计时（基于 `CONTEST_DEADLINE`）
  - 移动端：折叠菜单（Hamburger 按钮 + 下拉菜单）
- 使用 `lucide-react` 图标（`Home`, `Code2`, `Image`, `Timer`, `Menu`, `X`）
- 不在 Header 中暴露后台管理导航，管理员入口由路径直达 `/admin`。

### 底部页脚（`src/components/Footer.tsx`）

- 自适应布局：
  - 移动端居中，桌面端左侧版权、右侧备案信息：
    - 版权：`© 2025 李初一 · 比赛投稿门户`
    - 工信部备案：`https://beian.miit.gov.cn/`
    - 公安备案：带图标链接 `http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44200102445696`
- 外链统一使用 `target="_blank" rel="noopener noreferrer"`。

### 开场动画（`src/components/home/OpeningAnimation.tsx`）

- 使用 `useState<'idle' | 'dropping' | 'reading' | 'success' | 'exit'>` 管理阶段。
- `useEffect` + 一组 `setTimeout` 模拟“卡带插入主机”的复古开场动画：
  - 卡带下落、主机抖动、LED 指示灯、闪光扩散等效果。
- 内联 `@keyframes` + Tailwind 布局类实现复杂视觉效果。
- 通过 `onComplete` 回调通知父组件结束动画。

## 页面级组件

### 首页（`src/pages/HomePage.tsx`）

- 布局：
  - 背景：柔和渐变 + 自定义点阵背景（`bg-dot-pattern`）
  - 中央内容：比赛名称（`CONTEST_NAME`）+ 宣传文案
  - 两张赛道卡片：
    - 图形化编程 → `/programming`
    - AIGC 创意 → `/aigc`
  - 底部提示条：`截止日期前均可修改提交内容`
- 使用 `OpeningAnimation` 作为首次进入时的过场动画，正文淡入。

### 学生提交页（`src/pages/StudentSubmitPage.tsx`）

- 公共提交组件：`StudentSubmitPage({ targetCategory })`
  - 封装表单状态与提交逻辑，复用到两个赛道：
    - `ProgrammingSubmitPage` → `targetCategory="PROGRAMMING"`
    - `AigcSubmitPage` → `targetCategory="AIGC"`
- 表单字段：
  - 姓名：`studentName`
  - 年级：使用自定义下拉 `CustomSelect`（1–6 年级）
  - 班级：`CustomSelect`，1–12 班
  - 作品名称：`workTitle`，最长 50 字
  - 上传文件：依据 `ALLOWED_EXTENSIONS[targetCategory]` 限制扩展名
- 校验逻辑：
  - 前端检查必填项与文件扩展名
  - 提交前调用 `checkDailySubmission(studentName)`，限制每天一次提交
  - 通过 `createSubmission` 调用后端 `/submissions` 上传文件
- UI：
  - 编程赛道采用蓝色主题，AIGC 赛道采用紫色主题，通过 `tone` 控制样式。
  - 提交成功后展示成功信息卡片（作品名称、文件名、时间），提供“返回首页”按钮（`useNavigate`）。

### 管理员后台（`src/pages/AdminPage.tsx`）

- 登录：
  - 单独登录视图 `LoginView`，输入密码后调用 `login({ password })`
  - 登录成功后保存 `access_token` 到 `localStorage('adminToken')`
  - 使用 `ApiError` 捕获 401，展示 `密码错误或服务不可用`
- 数据展示：
  - 使用 token 调用：
    - `getSubmissions(token)` 获取全部提交
    - `getFinalSubmissions(token)` 获取去重后的最终作品
  - `viewMode: 'all' | 'final'` 切换视图
  - `searchTerm` 支持按姓名/班级过滤
  - `sortConfig` 支持按任意列排序（提交时间默认倒序）
  - `useMemo` 实现排序 + 过滤，避免重复计算
- 统计卡片：
  - 总记录数（或最终作品数）
  - 今日新增数
- 批量操作：
  - 使用 `Set<string>` 记录已选 submission id
  - 全选/反选当前过滤结果
  - 批量下载 ZIP：
    - 使用 `JSZip` 创建压缩包
    - 前端根据 `StudentSubmission` 生成规范化文件名：
      - `${年级}年级_${班级}班_${学生姓名}_${作品名}.${扩展名}`
    - 通过 `downloadSubmissionFile(id, token)` 获取单个 `Blob` 后加入 ZIP
- 表格组件：
  - 子组件 `SubmissionsTable`：
    - 负责渲染表头（排序指示）、行、选择框和下载按钮
    - 类别列使用 `CATEGORY_LABELS` 显示中文标签
  - 子组件 `Toolbar`：
    - 显示当前视图标题或批量选择状态
    - 搜索框 + 批量打包按钮
  - 子组件 `ViewToggle` / `StatsCards` / Info Banner 用于视图切换与提示说明。

## 布局与样式约定

- 全局背景：`bg-slate-50`，结合 `bg-dot-pattern` 形成轻量科技感。
- 内容宽度：统一使用 `max-w-7xl mx-auto px-4`（或略窄的 `max-w-4xl / 3xl`）保证阅读性。
- 响应式：
  - Header/Footer/Home/提交页/管理后台均使用 `md:` 断点适配桌面布局。
  - 移动端优先布局，按钮与点击区域保持足够尺寸。
- 自定义工具类：
  - `bg-dot-pattern`：在 `App.css` 中通过 `@layer utilities` 定义，用于复用点阵背景。

## 后续可扩展方向（建议）

- 为学生提交页和管理员后台增加更细粒度的筛选（按年级 / 类别）。
- 在管理员后台中增加导出 CSV/Excel 的功能，方便线下评审和归档。
- 在首页增加截止时间提醒倒计时（与 Header 的倒计时共用逻辑 Hook）。
- 引入数据获取库（如 TanStack Query）做缓存与错误重试，进一步优化管理后台体验。

