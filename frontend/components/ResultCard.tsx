import type { PredictResponse } from '@/lib/types'
import RiskBadge from './RiskBadge'

export default function ResultCard({ result }: { result: PredictResponse }) {
  return (
    <section className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm/60">
      <div className="bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">⏰ Berangkat jam</p>
        <p className="mt-2 font-mono text-7xl font-black tracking-tight text-indigo-700">{result.jam_berangkat}</p>
      </div>
      <div className="divide-y divide-gray-100 p-6">
        <div className="space-y-3 pb-5">
          <Row label="Prediksi durasi" value={`${result.prediksi_durasi_menit} menit`} />
          <Row label="Buffer keamanan" value={`${result.buffer_menit} menit`} />
          <Row label="Total waktu" value={`${result.total_menit} menit`} />
        </div>
        <div className="flex items-center justify-between py-5">
          <span className="font-medium text-gray-600">Risiko</span>
          <RiskBadge risk={result.risiko} />
        </div>
        <div className="pt-5">
          <p className="rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
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
