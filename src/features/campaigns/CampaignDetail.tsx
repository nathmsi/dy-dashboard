import { Badge } from '../../components/ui/Badge/Badge'
import type { Campaign } from '../../lib/types'
import styles from './CampaignDetail.module.css'

interface CampaignDetailProps {
  campaign: Campaign
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <h1>{campaign.name}</h1>
        <Badge status={campaign.status} />
      </div>
      <dl className={styles.grid}>
        <div className={styles.item}>
          <dt>Channel</dt>
          <dd>{campaign.channel}</dd>
        </div>
        <div className={styles.item}>
          <dt>Conversion rate</dt>
          <dd>{campaign.conversionRate.toFixed(1)}%</dd>
        </div>
        <div className={styles.item}>
          <dt>Visitors</dt>
          <dd>{campaign.visitors.toLocaleString('en-US')}</dd>
        </div>
        <div className={styles.item}>
          <dt>Start date</dt>
          <dd>{new Date(campaign.startDate).toLocaleDateString('en-US')}</dd>
        </div>
      </dl>
    </div>
  )
}
