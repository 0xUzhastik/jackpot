import { Header } from "@/components/Header";
import JackpotDonutChart from "@/components/JackpotDonutChart";
import PastDraws from "@/components/PastDraws";
import { ChatSection } from "@/components/ChatSection";
import { TokenInfo } from "@/components/TokenInfo";
import { FloatingTokens } from "@/components/FloatingTokens";
import { UserStats } from "@/components/UserStats";
import { SunburstBackground } from "@/components/SunburstBackground";
import { pastDraws, currentDeposits, chatMessages, totalPotAmount } from "@/lib/mock-data";

export default function Home() {
  const total = totalPotAmount();

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Animated Sunburst Background */}
      <SunburstBackground />
      
      <FloatingTokens />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <Header />
        
        <UserStats />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <PastDraws draws={pastDraws} deposits={currentDeposits} />
          </div>
          
          <div className="md:col-span-2">
            <JackpotDonutChart 
              deposits={currentDeposits}
              totalAmount={total}
            />
          </div>
          
          <div className="md:col-span-1 grid grid-rows-2 gap-6">
            <div>
              <ChatSection messages={chatMessages} />
            </div>
            <div>
              <TokenInfo />
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-black font-bold pb-8">
          <p>© 2025 JACKPOT. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-[#D50000] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#D50000] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#D50000] transition-colors">FAQ</a>
          </div>
        </footer>
      </div>
    </main>
  );
}