/* components/WalletTokensTable.tsx
   Lists SOL + SPL tokens held by the connected wallet.
   Uses Helius `/balances` for amounts and `getAssetBatch`
   (JSON-RPC) to pull symbol, name, and logo. */

'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ArrowLeftRight } from 'lucide-react';

/* ---------- env ---------- */
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_HELIUS_RPC!; // e.g. https://mainnet.helius-rpc.com/?api-key=xxx
const API_KEY = RPC_ENDPOINT.split('api-key=')[1] ?? '';  // reuse same key in REST URL

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

interface SelectedTokensTableProps {
  selectedTokens: TokenRow[];
  onRemoveToken: (mint: string) => void;
  onUpdateAmount: (mint: string, amount: number) => void;
}

function SelectedTokensTable({ selectedTokens, onRemoveToken, onUpdateAmount }: SelectedTokensTableProps) {
  if (selectedTokens.length === 0) return null;

  return (
    <div className="w-full mb-4 overflow-hidden rounded-lg border-2 border-[#D50000]">
      <div className="bg-[#D50000] text-[#FFD700] px-4 py-2 font-bold">
        Selected Tokens
      </div>
      <ScrollArea className="h-[200px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#D50000] text-[#FFD700]">
              <th className="px-4 py-3 text-left text-sm font-bold uppercase">Token</th>
              <th className="px-4 py-3 text-right text-sm font-bold uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedTokens.map((token, index) => (
              <motion.tr
                key={token.mint}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={index % 2 === 0 ? 'bg-[#FFD700]' : 'bg-[#F5E9C9]'}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src={token.image}
                        alt={token.symbol}
                        fill
                        className="rounded-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = '/solana-logo.png')}
                      />
                    </div>
                    {token.symbol}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-black">
                  {token.selectedAmount?.toLocaleString(undefined, {
                    maximumFractionDigits: token.decimals,
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveToken(token.mint)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

interface WalletTokensTableProps {
  onTokensSelected: (tokens: TokenRow[]) => void;
}

export default function WalletTokensTable({ onTokensSelected }: WalletTokensTableProps) {
  const { publicKey } = useWallet();
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<TokenRow[]>([]);

  const handleSelectToken = (token: TokenRow) => {
    const updatedRows = rows.map(t => 
      t.mint === token.mint 
        ? { ...t, selected: !t.selected, selectedAmount: !t.selected ? t.amount : undefined }
        : t
    );
    setRows(updatedRows);
    
    if (!token.selected) {
      const newSelectedTokens = [...selectedTokens, { ...token, selected: true, selectedAmount: token.amount }];
      setSelectedTokens(newSelectedTokens);
      onTokensSelected(newSelectedTokens);
    } else {
      const newSelectedTokens = selectedTokens.filter(t => t.mint !== token.mint);
      setSelectedTokens(newSelectedTokens);
      onTokensSelected(newSelectedTokens);
    }
  };

  const handleRemoveToken = (mint: string) => {
    const newSelectedTokens = selectedTokens.filter(t => t.mint !== mint);
    setSelectedTokens(newSelectedTokens);
    onTokensSelected(newSelectedTokens);
    setRows(rows.map(t => 
      t.mint === mint ? { ...t, selected: false, selectedAmount: undefined } : t
    ));
  };

  const handleUpdateAmount = (mint: string, amount: number) => {
    const newSelectedTokens = selectedTokens.map(t => 
      t.mint === mint ? { ...t, selectedAmount: amount } : t
    );
    setSelectedTokens(newSelectedTokens);
    onTokensSelected(newSelectedTokens);
    setRows(rows.map(t => 
      t.mint === mint ? { ...t, selectedAmount: amount } : t
    ));
  };

  const handleAmountChange = (mint: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const token = rows.find(t => t.mint === mint);
    if (!token) return;
    
    const maxAmount = token.amount;
    const clampedValue = Math.min(Math.max(0, numValue), maxAmount);
    handleUpdateAmount(mint, clampedValue);
  };

  const formatAmount = (amount: number, decimals: number) => {
    if (amount < 0.000001) {
      return amount.toExponential(decimals);
    }
    return amount.toLocaleString(undefined, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    });
  };

  /* ---------- fetch balances + metadata ---------- */
  useEffect(() => {
    if (!publicKey) {
      setRows([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        /* 1️⃣ Native SOL */
        const conn = new Connection(RPC_ENDPOINT);
        const lamports = await conn.getBalance(publicKey);
        const solRow: TokenRow = {
          mint: 'So11111111111111111111111111111111111111112',
          amount: lamports / LAMPORTS_PER_SOL,
          decimals: 9,
          symbol: 'SOL',
          name: 'Solana',
          image: 'https://solana.com/src/img/branding/solanaLogoMark.png',
        };

        /* 2️⃣ SPL balances list */
        const balURL = `https://api.helius.xyz/v0/addresses/${publicKey}/balances?api-key=${API_KEY}`;
        const { tokens } = await fetch(balURL).then((r) =>
          r.json() as Promise<{ tokens: any[] }>,
        );

        const nonZero = tokens.filter((t) => Number(t.amount) > 0);
        if (nonZero.length === 0) {
          setRows([solRow]);
          setLoading(false);
          return;
        }

        /* 3️⃣ Metadata via getAssetBatch (chunk 100 ids per call) */
        const chunks: string[][] = [];
        for (let i = 0; i < nonZero.length; i += 100)
          chunks.push(nonZero.slice(i, i + 100).map((t) => t.mint));

        const metaMap: Record<
          string,
          { symbol: string; name: string; image: string }
        > = {};

        const extract = (asset: any) => {
          const symbol =
            asset.token_info?.symbol ??
            asset.content?.metadata?.symbol ??
            asset.id.slice(0, 4);

          const name =
            asset.content?.metadata?.name ??
            symbol;

          const image =
            asset.content?.links?.image ||
            asset.content?.files?.[0]?.cdn_uri ||
            asset.content?.files?.[0]?.uri ||
            '/solana-logo.png';

          return { symbol, name, image };
        };

        await Promise.all(
          chunks.map(async (ids) => {
            const body = {
              jsonrpc: '2.0',
              id: 'asset-batch',
              method: 'getAssetBatch',
              params: { ids },
            };
            const res = await fetch(RPC_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const { result } = await res.json();
            result.forEach((asset: any) => {
              if (asset) metaMap[asset.id] = extract(asset);
            });
          }),
        );

        /* 4️⃣ Merge amounts + metadata */
        const tokenRows: TokenRow[] = nonZero.map((t) => {
          const uiAmt = Number(t.amount) / 10 ** t.decimals;
          const md =
            metaMap[t.mint] ?? {
              symbol: t.mint.slice(0, 4),
              name: t.mint.slice(0, 8),
              image: '/solana-logo.png',
            };
          return { mint: t.mint, amount: uiAmt, decimals: t.decimals, ...md };
        });

        setRows([solRow, ...tokenRows]);
      } catch (err) {
        console.error('Token table error:', err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey]);

  if (!publicKey) return null;

  /* ---------- UI ---------- */
  return (
    <>
      <SelectedTokensTable
        selectedTokens={selectedTokens}
        onRemoveToken={handleRemoveToken}
        onUpdateAmount={handleUpdateAmount}
      />
      <div className="w-full mb-4 overflow-hidden rounded-lg border-2 border-[#D50000]">
        <ScrollArea className="h-[200px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#D50000] text-[#FFD700]">
                <th className="px-4 py-3 text-left text-sm font-bold uppercase">
                  Token
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase">
                  Balance
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-sm">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-sm">
                    No tokens
                  </td>
                </tr>
              ) : (
                rows.map((t, i) => (
                  <>
                    <motion.tr
                      key={t.mint}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={i % 2 === 0 ? 'bg-[#FFD700]' : 'bg-[#F5E9C9]'}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6">
                            <Image
                              src={t.image}
                              alt={t.symbol}
                              fill
                              className="rounded-full object-cover"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).src =
                                  '/solana-logo.png')
                              }
                            />
                          </div>
                          {t.symbol}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-bold text-black">
                        {formatAmount(t.amount, t.decimals)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectToken(t)}
                          className={t.selected ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                        >
                          {t.selected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </td>
                    </motion.tr>
                    {t.selected && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={i % 2 === 0 ? 'bg-[#FFD700]' : 'bg-[#F5E9C9]'}
                      >
                        <td colSpan={3} className="px-4 py-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ArrowLeftRight className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-bold text-gray-700">Select Amount</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Available:</span>
                                <span className="text-sm font-mono">
                                  {formatAmount(t.amount, t.decimals)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                                </div>
                                <Slider
                                  value={[t.selectedAmount || t.amount]}
                                  min={0}
                                  max={t.amount}
                                  step={1 / Math.pow(10, t.decimals)}
                                  onValueChange={([value]) => handleUpdateAmount(t.mint, value)}
                                  className="relative z-10"
                                />
                              </div>
                              <div className="w-32">
                                <Input
                                  type="number"
                                  value={t.selectedAmount?.toFixed(t.decimals) || t.amount.toFixed(t.decimals)}
                                  onChange={(e) => handleAmountChange(t.mint, e.target.value)}
                                  min={0}
                                  max={t.amount}
                                  step={1 / Math.pow(10, t.decimals)}
                                  className="text-right font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0</span>
                              <span>{formatAmount(t.amount, t.decimals)}</span>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </>
  );
}
