import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JACKPOT - Solana Token Lottery',
  description: 'Deposit any SOL token and win the jackpot!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider network="mainnet-beta">
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}