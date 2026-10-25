import { Badge, type BadgeTone } from '@/components/ui/badge'
import type { TxStatus } from '@/lib/demo-data'

const STATUS_TONE: Record<TxStatus, BadgeTone> = {
  posted: 'success',
  pending: 'warning',
  draft: 'neutral',
}

const STATUS_LABEL: Record<TxStatus, string> = {
  posted: 'Posted',
  pending: 'Pending',
  draft: 'Draft',
}

export function StatusBadge({ status }: { status: TxStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}
