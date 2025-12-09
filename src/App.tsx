import '@/App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'
import { AigcSubmitPage, ProgrammingSubmitPage } from '@/pages/StudentSubmitPage'
import AdminPage from '@/pages/AdminPage'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {!isAdminRoute && <Header />}
      <main className="relative flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/programming" element={<ProgrammingSubmitPage />} />
          <Route path="/aigc" element={<AigcSubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
