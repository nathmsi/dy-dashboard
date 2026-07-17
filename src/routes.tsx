import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'))

export function AppRoutes() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      </Routes>
    </Suspense>
  )
}
