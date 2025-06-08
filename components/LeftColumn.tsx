"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { CurrentDeposits } from "./CurrentDeposits";
import { PastWinners } from "./PastWinners";
import { usePrivy } from '@privy-io/react-auth';

interface Deposit {
  id: string;
  user: string;
  token: string;
  amount: number;
  timestamp: Date;
}

interface LeftColumnProps {
  deposits: Deposit[];
  onDepositsChange?: (deposits: Deposit[]) => void;
}

export function LeftColumn({ deposits, onDepositsChange }: LeftColumnProps) {
  const [totalDeposits, setTotalDeposits] = useState(7961280);
  const { authenticated, logout } = usePrivy();

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalDeposits(prev => prev + Math.floor(Math.random() * (1000 - 100) + 100));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Logo - Fixed at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center items-center h-20 flex-shrink-0"
      >
        <Header />
      </motion.div>

      {/* Spacer to push content down */}
      <div className="flex-1"></div>

      {/* Bottom Content - Aligned to bottom */}
      <div className="flex flex-col gap-3 flex-shrink-0">
        {/* Logout Button - Centered above total deposits */}
        {authenticated && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center"
          >
            <Button
              onClick={logout}
              variant="outline"
              className="casino-box casino-box-gold px-3 py-2 border-2 border-[#FFD700] hover:border-[#FFFF00] hover:bg-[#FFD70015] transition-all duration-200 group"
              style={{ fontFamily: "Visby Round CF, SF Pro Display, sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="h-4 w-4 casino-text-gold rotate-180" />
                </motion.div>
                <span className="text-xs font-black casino-text-gold uppercase">
                  Logout
                </span>
              </div>
            </Button>
          </motion.div>
        )}

        {/* Total Deposits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="casino-box casino-box-gold overflow-hidden h-24 flex flex-col">
            <CardContent className="bg-gradient-to-b from-[#4A0E4E] to-[#2D0A30] p-2 flex-1 flex flex-col justify-center items-center">
              <p className="text-base sm:text-lg md:text-xl uppercase font-bold text-center tracking-wider casino-text-yellow mb-1"
                style={{ fontFamily: "Visby Round CF, SF Pro Display, sans-serif" }}>
                Total Deposits
              </p>
              <div className="text-xl sm:text-2xl md:text-3xl font-black casino-text-gold flex items-center"
                style={{ fontFamily: "Visby Round CF, SF Pro Display, sans-serif" }}>
                $<SlidingNumber value={totalDeposits} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Round - Fixed height for consistency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-[45vh]"
        >
          <CurrentDeposits 
            deposits={deposits}
            onDepositsChange={onDepositsChange}
          />
        </motion.div>

        {/* Past Winners - Fixed height that aligns with chat bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="h-[180px]"
        >
          <PastWinners />
        </motion.div>
      </div>
    </div>
  );
}