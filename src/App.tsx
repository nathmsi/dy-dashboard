import { useState } from 'react'
import { CampaignDetailPage } from './pages/CampaignDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import type { Campaign } from './lib/types'

function App() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  return (
    <main>
      {selectedCampaign ? (
        <CampaignDetailPage campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
      ) : (
        <DashboardPage onSelectCampaign={setSelectedCampaign} />
      )}
    </main>
  )
}

export default App
