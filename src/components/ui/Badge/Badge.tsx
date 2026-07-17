import type { CampaignStatus } from '../../../lib/types'
import styles from './Badge.module.css'

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
}

interface BadgeProps {
  status: CampaignStatus
}

export function Badge({ status }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[status]}`}>{STATUS_LABEL[status]}</span>
}
