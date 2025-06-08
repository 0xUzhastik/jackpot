'use client';

import JackpotDonutChart from "@/components/JackpotDonutChart";
import { ChatSection } from "@/components/ChatSection";
import { FloatingTokens } from "@/components/FloatingTokens";
import { SunburstBackground } from "@/components/SunburstBackground";
import { YourTokens } from "@/components/YourTokens";
import { SelectedTokens } from "@/components/SelectedTokens";
import { LeftColumn } from "@/components/LeftColumn";
import { RightColumn } from "@/components/RightColumn";
import { EnterRound } from "@/components/EnterRound";
import { ThirdRow } from "@/components/ThirdRow";
import { chatMessages } from "@/lib/mock-data";
import { useState } from "react";

interface Deposit {
  id: string;
  user: string;
  token: string;
  amount: number;
  timestamp: Date;
}

interface TokenRow {
  mint: string;
  amount: number;
  decimals: number;
  symbol: string;
  name: string;
  image: string;
  selected?: boolean;
  selectedAmount?: number;
}

export default function Home() {
  // State for current round deposits - shared between donut chart and deposits table
  const [currentRoundDeposits, setCurrentRoundDeposits] = useState<Deposit[]>([]);
  
  // State for selected tokens (for the Your Tokens component)
  const [selectedTokens, setSelectedTokens] = useState<TokenRow[]>([]);
  
  // State for which token should auto-expand (delayed)
  const [delayedExpandToken, setDelayedExpandToken] = useState<string | null>(null);
  
  // Calculate total from current round deposits
  const total = currentRoundDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  const handleTokenSelect = (token: TokenRow) => {
    const alreadySelected = selectedTokens.find(t => t.mint === token.mint);
    if (alreadySelected) return; // Already selected
    
    const newToken = { ...token, selectedAmount: token.amount * 0.5 }; // Default 50%
    
    // Add to the TOP of the list (beginning of array) - CLOSED initially
    setSelectedTokens([newToken, ...selectedTokens]);
    
    // After a small delay, auto-expand the newly added token
    setTimeout(() => {
      setDelayedExpandToken(newToken.mint);
    }, 300); // Give time for the token to render first
  };

  const handleRemoveToken = (mint: string) => {
    setSelectedTokens(selectedTokens.filter(t => t.mint !== mint));
    
    // Clear delayed expand if removing the token that was about to expand
    if (delayedExpandToken === mint) {
      setDelayedExpandToken(null);
    }
  };

  const handleUpdateAmount = (mint: string, amount: number) => {
    setSelectedTokens(selectedTokens.map(t => 
      t.mint === mint ? { ...t, selectedAmount: amount } : t
    ));
  };

  const handleClearDelayedExpand = () => {
    setDelayedExpandToken(null);
  };

  const selectedTokenMints = selectedTokens.map(t => t.mint);

  return (
    <main className="h-screen w-screen relative overflow-hidden">
      {/* Grid Background */}
      <SunburstBackground /> 

      <FloatingTokens />

      <div className="w-full h-full grid grid-rows-[1fr_auto] gap-1 p-2">
        {/* Main Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full h-full min-h-0">
          {/* Left Column - Logo, Total Deposits, Current Round, Past Winners */}
          <div className="md:col-span-1 h-full">
            <LeftColumn 
              deposits={currentRoundDeposits}
              onDepositsChange={setCurrentRoundDeposits}
            />
          </div>
          
          {/* Center Column - Donut Chart + Enter Round + Your Tokens & Selected Tokens */}
          <div className="md:col-span-2 w-full max-w-full min-w-0 h-full flex flex-col gap-2">
            {/* Donut Chart - Takes up about half the height */}
            <div className="flex-1 min-h-0 max-h-[50%]">
              <JackpotDonutChart
                deposits={currentRoundDeposits}
                totalAmount={total}
                simulateData={true}
                onDepositsChange={setCurrentRoundDeposits}
              />
            </div>
            
            {/* Enter Round Button */}
            <div className="flex-shrink-0">
              <EnterRound 
                selectedTokens={selectedTokens}
                onSelectedTokensChange={setSelectedTokens}
              />
            </div>
            
            {/* Your Tokens and Selected Tokens side by side - Flexible height to align with other columns */}
            <div className="flex-1 min-h-0 max-h-[45vh]">
              <div className="grid grid-cols-2 gap-2 h-full">
                {/* Your Tokens - Left */}
                <div className="h-full">
                  <YourTokens 
                    onTokenSelect={handleTokenSelect}
                    selectedTokenMints={selectedTokenMints}
                  />
                </div>
                
                {/* Selected Tokens - Right */}
                <div className="h-full">
                  <SelectedTokens 
                    selectedTokens={selectedTokens}
                    onRemoveToken={handleRemoveToken}
                    onUpdateAmount={handleUpdateAmount}
                    delayedExpandToken={delayedExpandToken}
                    onClearDelayedExpand={handleClearDelayedExpand}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Largest Win + Chat */}
          <div className="md:col-span-1 w-full max-w-full min-w-0 overflow-hidden h-full flex flex-col">
            <RightColumn messages={chatMessages} />
          </div>
        </div>

        {/* Bottom Row - Just logout button now */}
        <ThirdRow />
      </div>
    </main>
  );
}