import { useSearchParams } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import ApplicationStatusCard from '@/components/dashboard/ApplicationStatusCard'
import ProcessingOfferCard from '@/components/dashboard/ProcessingOfferCard'
import QuickActions from '@/components/dashboard/QuickActions'
import Sidebar from '@/components/dashboard/Sidebar'
import HologramCard from '@/components/brand/HologramCard'
import { useAuth } from '@/context/AuthContext'

// Dedicated Tab Views
import ApplicationTab from '@/components/dashboard/tabs/ApplicationTab'
import DocumentsTab from '@/components/dashboard/tabs/DocumentsTab'
import MessagesTab from '@/components/dashboard/tabs/MessagesTab'
import OfferTab from '@/components/dashboard/tabs/OfferTab'
import SettingsTab from '@/components/dashboard/tabs/SettingsTab'
import IntegrationTab from '@/components/dashboard/tabs/IntegrationTab'
import InvoicesTab from '@/components/dashboard/tabs/InvoicesTab'

export default function DashboardPage() {
  const { merchant } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const displayName = merchant?.fullName ? merchant.fullName.split(' ')[0] : 'Merchant'

  // Derive active tab from searchParams (default: 'dashboard')
  const validTabs = ['dashboard', 'integration', 'invoices', 'application', 'documents', 'messages', 'offer', 'settings']
  const tabParam = searchParams.get('tab') || 'dashboard'
  const activeTab = validTabs.includes(tabParam) ? tabParam : 'dashboard'

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab })
  }

  return (
    <div className="w-full max-w-[1440px] min-w-0 min-h-[calc(100vh-4.5rem)] mx-auto p-3.5 sm:p-6 lg:p-8 relative overflow-x-hidden">
      
      {/* Background Radial Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Main Grid: Sidebar on Left, Content on Right */}
      <div className="w-full max-w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* Left Sidebar (Col 3 on desktop) */}
        <div className="lg:col-span-3 w-full max-w-full min-w-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Main Content Area (Col 9 on desktop) */}
        <div className="lg:col-span-9 w-full max-w-full min-w-0 space-y-5 sm:space-y-6">
          
          {/* TAB 1: Dashboard (Overview) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in w-full min-w-0">
              {/* Welcome Header + Hologram Card Visual */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 relative w-full min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {merchant?.avatarUrl ? (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.4)] shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#050a1d]">
                        <img
                          src={merchant.avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] break-words">
                      Welcome, {displayName}
                    </h1>
                    <p className="text-xs sm:text-base text-slate-300">
                      Track your application, configure website integration, and view your processing offer.
                    </p>
                  </div>
                </div>

                {/* Hologram Card (right aligned) */}
                <div className="hidden md:flex justify-end pr-4 shrink-0">
                  <HologramCard size="sm" />
                </div>
              </div>

              {/* White-Glove Integration Banner */}
              <div 
                onClick={() => handleTabChange('integration')}
                className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-[#09153a] via-[#0f235e] to-[#09153a] border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-between gap-4 cursor-pointer hover:border-cyan-300 transition-all group w-full min-w-0"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 group-hover:scale-105 transition-transform shrink-0">
                    <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="break-words">White-Glove GitHub & Website Integration Desk</span>
                      <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/40 shrink-0">Action Desk</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
                      Pay setup fee, invite our official GitHub account, submit .env secrets, and chat directly with Super Admin.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs group-hover:bg-cyan-300 transition-colors shrink-0"
                >
                  Open Workspace &rarr;
                </button>
              </div>

              {/* Row 1: Status & Processing Offer Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApplicationStatusCard />
                <ProcessingOfferCard />
              </div>

              {/* Row 2: 4 Quick Action Cards */}
              <div className="pt-2">
                <QuickActions onNavigateTab={handleTabChange} />
              </div>
            </div>
          )}

          {/* TAB: Integration & Collab */}
          {activeTab === 'integration' && <IntegrationTab />}

          {/* TAB: Weekly Invoices (PRD Section 07) */}
          {activeTab === 'invoices' && <InvoicesTab />}

          {/* TAB 2: My Application */}
          {activeTab === 'application' && <ApplicationTab />}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && <DocumentsTab />}

          {/* TAB 4: Messages */}
          {activeTab === 'messages' && <MessagesTab />}

          {/* TAB 5: Offer */}
          {activeTab === 'offer' && <OfferTab />}

          {/* TAB 6: Account Settings */}
          {activeTab === 'settings' && <SettingsTab />}

        </div>

      </div>

      {/* Bottom Glowing Neon Horizon Arc */}
      <div className="mt-12 relative w-full h-8 overflow-hidden pointer-events-none select-none">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[120%] h-32 rounded-[100%] border-t-2 border-cyan-400 shadow-[0_-4px_25px_rgba(0,240,255,0.7),0_-10px_50px_rgba(217,70,239,0.5)]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-48 h-2 bg-cyan-300 blur-sm rounded-full" />
      </div>

    </div>
  )
}
