import { CartPanel } from './components/CartPanel'
import { Header } from './components/Header'
import { RideList } from './components/RideList'

export default function App() {
  return (
    <div className="min-h-svh bg-gray-50">
      <Header />
      <main className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[1fr_340px]">
        <RideList />
        <CartPanel />
      </main>
    </div>
  )
}
