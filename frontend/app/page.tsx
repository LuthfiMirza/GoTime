import PredictForm from '@/components/PredictForm'

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <span className="font-display text-lg font-bold">GoTime</span>
          <span className="text-sm text-zinc-500">ML-powered departure planner</span>
        </div>
      </nav>

      <section className="mx-auto max-w-2xl px-4 pb-8 pt-12 text-center">
        <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          FastAPI + Random Forest ML
        </div>
        <h1 className="mb-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Berangkat tepat waktu,<br />
          <span className="text-indigo-600">setiap saat.</span>
        </h1>
        <p className="text-lg leading-8 text-zinc-500">
          Masukkan detail perjalananmu, dan GoTime akan menghitung kapan kamu harus berangkat menggunakan Machine Learning.
        </p>
      </section>

      <PredictForm />

      <footer className="mx-auto max-w-2xl px-4 py-10 text-center text-sm text-zinc-500">
        Dibuat sebagai full-stack portfolio project dengan Next.js, FastAPI, dan Machine Learning.
      </footer>
    </main>
  )
}
