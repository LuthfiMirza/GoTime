import type { PredictResponse } from '@/lib/types'

const styles: Record<PredictResponse['risiko'], string> = {
  Rendah: 'bg-green-600 text-white',
  Sedang: 'bg-orange-500 text-white',
  Tinggi: 'bg-red-500 text-white',
}

export default function RiskBadge({ risk }: { risk: PredictResponse['risiko'] }) {
  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${styles[risk]}`}>{risk}</span>
}
