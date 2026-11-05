import ApplicationStatusCard from '@/components/dashboard/ApplicationStatusCard'
import ProcessingOfferCard from '@/components/dashboard/ProcessingOfferCard'
import QuickActions from '@/components/dashboard/QuickActions'
import Sidebar from '@/components/dashboard/Sidebar'
import HologramCard from '@/components/brand/HologramCard'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage() {
  const { merchant } = useAuth()
  const displayName = merchant?.fullName ? merchant.fullName.split(' ')[0] : 'Merchant'

  return (
    <div className="min-h-[calc(100vh-4.5rem)] max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 relative">
      
      {/* Background Radial Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Main Grid: Sidebar on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar (Col 3 on desktop) */}
        <div className="lg:col-span-3 w-full">
          <Sidebar />
        </div>

        {/* Main Content Area (Col 9 on desktop) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Welcome Header + Hologram Card Visual */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 relative">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                Welcome, {displayName}
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Track your application and view your processing offer.
              </p>
            </div>

            {/* Hologram Card (right aligned) */}
            <div className="hidden md:flex justify-end pr-8">
              <div className="scale-85 origin-right">
                <HologramCard />
              </div>
            </div>
          </div>

          {/* Row 1: Status & Processing Offer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ApplicationStatusCard />
            <ProcessingOfferCard />
          </div>

          {/* Row 2: 4 Quick Action Cards */}
          <div className="pt-2">
            <QuickActions />
          </div>

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
