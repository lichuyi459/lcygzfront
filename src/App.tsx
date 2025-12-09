import '@/App.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="relative flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}

export default App
