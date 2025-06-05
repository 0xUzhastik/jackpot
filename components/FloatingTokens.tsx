"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Token {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  symbol: string;
}

export function FloatingTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  
  useEffect(() => {
    // Generate random tokens
    const tokensArray: Token[] = [];
    const symbols = ["SOL", "BONK", "JUP", "RAY", "USDC", "WIF", "SWIF"];
    
    for (let i = 0; i < 12; i++) {
      tokensArray.push({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 100,
        size: 20 + Math.random() * 30,
        speed: 20 + Math.random() * 60,
        symbol: symbols[Math.floor(Math.random() * symbols.length)]
      });
    }
    
    setTokens(tokensArray);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {tokens.map((token) => (
        <motion.div
          key={token.id}
          className="absolute font-bold font-mono text-[#FFD700]"
          style={{
            fontSize: token.size,
            left: `${token.x}%`,
            textShadow: "2px 2px 0 #000"
          }}
          initial={{ y: token.y + "vh" }}
          animate={{ 
            y: "120vh",
            rotate: [0, 15, -15, 0]
          }}
          transition={{ 
            duration: token.speed,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            times: [0, 0.25, 0.75, 1]
          }}
        >
          {token.symbol}
        </motion.div>
      ))}
    </div>
  );
}