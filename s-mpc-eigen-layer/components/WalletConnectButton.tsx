import type React from "react"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount, useBalance, useDisconnect } from "wagmi"

export const WalletConnectButton: React.FC = () => {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <div className="text-sm">
          Balance: {balance?.formatted} {balance?.symbol}
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
      Connect Wallet
    </button>
  )
}

