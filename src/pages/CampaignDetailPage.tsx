import { Button } from '../components/ui/Button/Button'
import { CampaignDetail } from '../features/campaigns/CampaignDetail'
import type { Campaign } from '../lib/types'
import styles from './CampaignDetailPage.module.css'

interface CampaignDetailPageProps {
  campaign: Campaign
  onBack: () => void
}

export function CampaignDetailPage({ campaign, onBack }: CampaignDetailPageProps) {
  return (
    <div>
      <Button variant="secondary" className={styles.backButton} onClick={onBack}>
        ← Back to campaigns
      </Button>
      <CampaignDetail campaign={campaign} />
    </div>
  )
}
