"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { useState, useEffect } from "react";

export function UserStats() {
  const [totalDeposits, setTotalDeposits] = useState(5200000);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalDeposits(prev => prev + Math.floor(Math.random() * (1000 - 100) + 100));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Deposits", value: totalDeposits, prefix: "$" },
    { label: "Winners", value: 384, prefix: "" },
    { label: "Average Pot", value: 1250, prefix: "$" },
    { label: "Largest Win", value: 28400, prefix: "$" }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="ticket-box overflow-hidden p-0 border-4 border-[#FFD700] bg-[#D50000]">
            <div className="p-2 bg-[#D50000]">
              <p 
                className="text-white text-lg uppercase font-bold text-center tracking-wider" 
                style={{ 
                  fontFamily: "Impact, Arial Black, sans-serif",
                  fontWeight: 900,
                  position: "relative",
                  zIndex: 3,
                  WebkitTextStroke: "0px #000",
                  textShadow: `
                    0 1px 0 #FF6B6B,
                    0 2px 0 #FF6B6B,
                    0 3px 0 #9E0000,
                    0 4px 0 #9E0000,
                    0 5px 0 #9E0000,
                    0 6px 8px rgba(0, 0, 0, 0.9)
                  `
                }}
              >
                {stat.label}
              </p>
            </div>
            <div className="bg-[#F5E9C9] p-4 flex justify-center items-center">
              <div className="text-3xl md:text-4xl font-mono font-black text-black flex items-center">
                {stat.prefix}<SlidingNumber value={stat.value} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}