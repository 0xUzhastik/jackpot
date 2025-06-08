"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { ChatSection } from "./ChatSection";
import { ChatMessage } from "@/lib/types";

interface RightColumnProps {
  messages: ChatMessage[];
}

export function RightColumn({ messages }: RightColumnProps) {
  return (
    <div className="h-full flex flex-col gap-2">
      {/* Largest Win */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0"
      >
        <Card className="casino-box casino-box-gold overflow-hidden h-28 flex flex-col">
          <CardContent className="bg-gradient-to-b from-[#4A0E4E] to-[#2D0A30] p-2 flex-1 flex flex-col justify-center items-center">
            <p className="text-lg sm:text-xl md:text-2xl uppercase font-bold text-center tracking-wider casino-text-yellow mb-2"
              style={{ fontFamily: "Visby Round CF, SF Pro Display, sans-serif" }}>
              Largest Win
            </p>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black casino-text-gold flex items-center"
              style={{ fontFamily: "Visby Round CF, SF Pro Display, sans-serif" }}>
              $<SlidingNumber value={28400} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 min-h-0"
      >
        <ChatSection messages={messages} />
      </motion.div>
    </div>
  );
}