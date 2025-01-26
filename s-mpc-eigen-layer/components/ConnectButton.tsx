"use client"

import { useAccount, useDisconnect } from "wagmi"
import { useState } from "react"

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConnect = () => {
    // Implement your wallet connection logic here
    // This might involve opening a wallet selection modal or triggering a connection
    setIsModalOpen(true)
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <span>{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
          <button 
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

