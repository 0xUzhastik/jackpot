"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CircleDollarSignIcon, Dice5Icon, TrendingUpIcon, ShieldIcon } from "lucide-react";

interface TokenInfoItem {
  name: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export function TokenInfo() {
  const tokenInfoItems: TokenInfoItem[] = [
    { 
      name: "Token", 
      value: "$JACKPOT", 
      description: "Lottery governance token", 
      icon: <CircleDollarSignIcon className="h-6 w-6" />
    },
    { 
      name: "Odds", 
      value: "1:500", 
      description: "For every 500 tickets, 1 winner", 
      icon: <Dice5Icon className="h-6 w-6" />
    },
    { 
      name: "Price", 
      value: "$0.028", 
      description: "+15.4% in last 24h", 
      icon: <TrendingUpIcon className="h-6 w-6" />
    },
    { 
      name: "Security", 
      value: "Audited", 
      description: "By OtterSec & Halborn", 
      icon: <ShieldIcon className="h-6 w-6" />
    },
  ];

  return (
    <Card className="ticket-box overflow-hidden p-0 border-4 border-[#FFD700] bg-[#D50000] h-full flex flex-col">
      <div className="p-2 bg-[#D50000] flex justify-center">
        <CardTitle 
          className="text-3xl font-bold uppercase text-center tracking-wider text-[#FFD700]" 
          style={{ 
            fontFamily: "Impact, Arial Black, sans-serif",
            fontWeight: 900,
            position: "relative",
            zIndex: 3,
            WebkitTextStroke: "0px var(--ticket-red)",
            textShadow: `
              0 1px 0 #FFE866,
              0 2px 0 #FFE866,
              0 3px 0 #B39700,
              0 4px 0 #B39700,
              0 5px 0 #B39700,
              0 6px 8px rgba(0, 0, 0, 0.9)
            `
          }}
        >
          Tokenomics
        </CardTitle>
      </div>
      
      <CardContent className="bg-[#D50000] p-4 flex-1">
        <div className="grid grid-rows-4 gap-2 h-full">
          {tokenInfoItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-2 border-[#D50000] rounded-xl bg-[#F5E9C9] p-2 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[#D50000]">
                  {item.icon}
                </div>
                <span className="font-bold text-black">{item.name}</span>
              </div>
              <div className="font-mono font-black text-lg text-black">{item.value}</div>
              <div className="text-xs text-[#D50000] font-bold">{item.description}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}