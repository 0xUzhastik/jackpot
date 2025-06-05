'use client';

import { FC, ReactNode, useMemo } from 'react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

require('@solana/wallet-adapter-react-ui/styles.css'); // <- once, at top level

interface Props {
  children: ReactNode;
  network?: 'devnet' | 'mainnet-beta' | 'testnet';
}

export const SolanaWalletProvider: FC<Props> = ({
  children,
  network = 'mainnet-beta',
}) => {
  // Prefer the Helius URL from env; otherwise fall back to public RPC
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_HELIUS_RPC || clusterApiUrl(network);
  }, [network]);

  /* 2️⃣ Wallets you want to expose */
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
