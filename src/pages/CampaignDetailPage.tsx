import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button/Button'
import { CampaignDetail } from '../features/campaigns/CampaignDetail'
import { useCampaign } from '../features/campaigns/useCampaigns'
import styles from './CampaignDetailPage.module.css'

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: campaign, isLoading, isError } = useCampaign(id)

  return (
    <div>
      <Button variant="secondary" className={styles.backButton} onClick={() => navigate('/')}>
        ← Back to campaigns
      </Button>
      {isLoading && <p>Loading campaign…</p>}
      {isError && <p role="alert">Something went wrong loading this campaign.</p>}
      {!isLoading && !isError && !campaign && <p>Campaign not found.</p>}
      {campaign && <CampaignDetail campaign={campaign} />}
    </div>
  )
}
