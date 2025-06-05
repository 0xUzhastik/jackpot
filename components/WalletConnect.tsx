import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { WalletIcon } from 'lucide-react';

export function WalletConnect() {
  const { login, authenticated, user } = usePrivy();

  return (
    <div className="w-full flex items-center justify-center p-4">
      {!authenticated ? (
        <Button
          onClick={login}
          className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-bold flex items-center gap-2"
        >
          <WalletIcon className="h-5 w-5" />
          Connect Wallet
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600">Connected as:</p>
          <p className="font-bold text-[#8A2BE2]">{user?.wallet?.address.slice(0, 6)}...{user?.wallet?.address.slice(-4)}</p>
        </div>
      )}
    </div>
  );
} 