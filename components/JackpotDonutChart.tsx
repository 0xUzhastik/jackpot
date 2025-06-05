/* components/JackpotDonutChart.tsx
   — Pot total + timer now sit **inside** the donut.
   — Timer label reads "Round ends in". */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import WalletTokensTable from '@/components/WalletTokensTable';
import { toast } from '@/hooks/use-toast';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils';

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

interface JackpotDonutChartProps {
  deposits: Deposit[];
  totalAmount: number;
}

interface Deposit {
  id: string;
  user: string;
  token: string;
  amount: number;
  timestamp: Date;
  color: string;
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

export default function JackpotDonutChart({
  deposits,
  totalAmount,
}: JackpotDonutChartProps) {
  const { connection }   = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const jackpotAddr      = new PublicKey(process.env.NEXT_PUBLIC_JACKPOT_ADDRESS!);

  const [selectedTokens, setSelectedTokens] = useState<TokenRow[]>([]);
  const [depositing, setDepositing]         = useState(false);

  /* ---------------- donut sizing ---------------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDims, setChartDims] = useState({ innerRadius: 60, outerRadius: 80 });
  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      const r = Math.min(w, h) * 0.5;
      setChartDims({ innerRadius: r * 0.75, outerRadius: r * 0.95 });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------------- countdown ---------------- */
  const [countdown, setCountdown] = useState({ h: 2, m: 15, s: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((p) => {
        const t = p.h * 3600 + p.m * 60 + p.s - 1;
        if (t <= 0) return { h: 2, m: 15, s: 0 };
        return { h: ~~(t / 3600), m: ~~((t % 3600) / 60), s: t % 60 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const formattedTime = `${String(countdown.h).padStart(2, '0')}:${String(
    countdown.m,
  ).padStart(2, '0')}`;

  /* ---------------- chart data ---------------- */
  const ticketColors = ['#0066CC', '#00A651', '#8A2BE2', '#FF6B00'];
  const remainingCap = 2000 - totalAmount;
  const chartData = [
    ...deposits.slice(0, 4).map((d) => ({ name: d.user, value: d.amount, color: d.color })),
    { name: 'Remaining', value: remainingCap > 0 ? remainingCap : 0, color: '#333' },
  ];
  const RAD = Math.PI / 180;
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    if (name === 'Remaining' || percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        stroke="#000"
        strokeWidth={1}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  /* ---------------- tx builder ---------------- */
  const buildTx = async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    const tx = new Transaction();

    for (const tok of selectedTokens) {
      const amt = tok.selectedAmount ?? 0;
      if (amt <= 0) continue;

      if (tok.mint === 'So11111111111111111111111111111111111111112') {
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: jackpotAddr,
            lamports: Math.round(amt * LAMPORTS_PER_SOL),
          }),
        );
      } else {
        const mint = new PublicKey(tok.mint);
        const fromAta = getAssociatedTokenAddressSync(mint, publicKey);
        const toAta   = getAssociatedTokenAddressSync(mint, jackpotAddr, true);

        if (!(await connection.getAccountInfo(toAta))) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              toAta,
              jackpotAddr,
              mint,
            ),
          );
        }
        const rawAmt = BigInt(Math.round(amt * 10 ** tok.decimals));
        tx.add(createTransferInstruction(fromAta, toAta, publicKey, rawAmt));
      }
    }

    tx.feePayer        = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return tx;
  };

  const onDeposit = async () => {
    if (!publicKey) {
      toast({ title: 'Connect wallet', variant: 'destructive' });
      return;
    }
    if (selectedTokens.length === 0) return;
    try {
      setDepositing(true);
      const tx  = await buildTx();
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');
      toast({ title: 'Deposit successful', description: sig });
      setSelectedTokens([]);
    } catch (e: any) {
      toast({ title: 'Deposit failed', description: e?.message ?? '', variant: 'destructive' });
    } finally {
      setDepositing(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Card className="ticket-box ticket-box-yellow flex flex-col items-center py-4">
      <CardContent className="w-full flex flex-col items-center gap-6">
        {/* donut + inner totals */}
        <div ref={containerRef} className="relative w-full h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={chartDims.innerRadius}
                outerRadius={chartDims.outerRadius}
                dataKey="value"
                labelLine={false}
                label={renderLabel}
                stroke="none"
              >
                {chartData.map((e, i) => (
                  <Cell
                    key={i}
                    fill={e.name !== 'Remaining' ? ticketColors[i % ticketColors.length] : e.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* center overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* pot total */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-center"
            >
              <span
                className="block text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-[#FFD700]"
                style={{ textShadow: '2px 2px 0 #000' }}
              >
                ${totalAmount.toFixed(0)}
              </span>
            </motion.div>

            {/* timer */}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-xs uppercase font-bold tracking-wide text-gray-200">
                Round ends in
              </span>
              <span
                className="text-2xl sm:text-3xl font-mono font-bold text-[#FFD700]"
                style={{ textShadow: '1px 1px 0 #000' }}
              >
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* token picker */}
        <WalletTokensTable onTokensSelected={setSelectedTokens} />

        {/* wallet controls + deposit */}
        <div className="flex flex-col items-center gap-3 w-full">
          <WalletMultiButton className="!bg-[#FFD700] !text-black font-bold w-full" />
          <Button
            onClick={onDeposit}
            disabled={depositing || selectedTokens.length === 0}
            className="w-full bg-[#FFD700] text-black font-bold disabled:opacity-50"
          >
            {depositing ? 'Processing…' : 'Deposit selected'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
