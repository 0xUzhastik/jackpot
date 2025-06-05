"use client";

import { PastDraw, Deposit } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeAgo } from "@/lib/utils";

interface PastDrawsProps {
  draws: PastDraw[];
  deposits: Deposit[];
}

export default function PastDraws({ draws, deposits }: PastDrawsProps) {
  const ticketColors = ['#0066CC', '#00A651', '#8A2BE2', '#FF6B00'];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Deposits Section */}
      <Card className="ticket-box ticket-box-yellow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold uppercase text-black border-b-2 border-black pb-2">Deposits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#D50000] text-[#FFD700]">
                  <th className="w-[45%] px-2 py-2 text-left text-xs font-bold uppercase">User</th>
                  <th className="w-[25%] px-2 py-2 text-left text-xs font-bold uppercase">Token</th>
                  <th className="w-[30%] px-2 py-2 text-right text-xs font-bold uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={i % 2 === 0 ? 'bg-[#FFD700]' : 'bg-[#F5E9C9]'}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-black">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: ticketColors[i % ticketColors.length] }} />
                        <span className="truncate">{d.user}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-black">
                      {d.token}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-right font-mono font-bold text-black">
                      ${d.amount.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Past Draws Section */}
      <Card className="ticket-box ticket-box-yellow flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold uppercase text-black border-b-2 border-black pb-2">Past Draws</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 60px)" }}>
          {draws.map((draw, index) => (
            <motion.div 
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-black">{draw.name}</h3>
                <a 
                  href="#" 
                  className="text-[#0066CC] text-sm hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Verify Fairness
                </a>
              </div>
              <span className="text-xl font-mono font-bold text-black">
                {draw.amount.toLocaleString(undefined, { 
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1 
                })}
              </span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}