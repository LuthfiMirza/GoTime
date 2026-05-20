import type { PredictResponse } from '@/lib/types'
import RiskBadge from './RiskBadge'

export default function ResultCard({ result }: { result: PredictResponse }) {
  return (
    <section className="animate-fade-in overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-xl shadow-indigo-100/70 dark:border-indigo-900 dark:bg-zinc-900 dark:shadow-none">
      <div className="bg-indigo-600 p-6 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-100">⏰ Berangkat jam</p>
        <p className="mt-2 font-mono text-6xl font-bold tracking-tight">{result.jam_berangkat}</p>
      </div>
      <div className="divide-y divide-zinc-200 p-6 dark:divide-zinc-800">
        <div className="space-y-3 pb-5">
          <Row label="Prediksi durasi" value={`${result.prediksi_durasi_menit} menit`} />
          <Row label="Buffer keamanan" value={`${result.buffer_menit} menit`} />
          <Row label="Total waktu" value={`${result.total_menit} menit`} />
        </div>
        <div className="flex items-center justify-between py-5">
          <span className="font-medium text-zinc-600 dark:text-zinc-300">Risiko</span>
          <RiskBadge risk={result.risiko} />
        </div>
        <div className="pt-5">
          <p className="rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-100">
            💡 <span className="font-semibold">Tips:</span> {result.tips}
          </p>
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  )
}
