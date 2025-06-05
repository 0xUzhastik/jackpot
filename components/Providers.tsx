'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import {toSolanaWalletConnectors} from "@privy-io/react-auth/solana";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}

      config={{

        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#FFD700',
          walletChainType: 'solana-only',
        },
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
    solanaClusters: [{name: 'mainnet-beta', rpcUrl: 'https://api.mainnet-beta.solana.com'}]

      }}
    >
      {children}
    </PrivyProvider>
  );
} 