import { useAccount, useDisconnect } from 'wagmi'
import { Button } from './ui/button';

export default function Header() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Guest';

  return (
    <header className="w-[78.5%] ml-4 mt-2 bg-[#0b0d12] shadow px-8 py-3 flex fixed top-0 left-64 z-30 h-16 border border-gray-800">
      {/* Notice left-64 matches your sidebar width */}
      <div className="flex gap-[2%] items-center w-full justify-end">
        <span className="text-gray-100 font-semibold">
          Welcome, <span className="font-mono text-blue-400">{shortAddress}</span>
        </span>
        <Button
          onClick={() => disconnect()}
          variant="connect"
          aria-label="Logout"
          title="Logout"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
