import type { PredictResponse } from '@/lib/types'

const styles: Record<PredictResponse['risiko'], string> = {
  Rendah: 'bg-green-100 text-green-800 ring-green-200',
  Sedang: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  Tinggi: 'bg-red-100 text-red-800 ring-red-200',
}

export default function RiskBadge({ risk }: { risk: PredictResponse['risiko'] }) {
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${styles[risk]}`}>{risk}</span>
}
