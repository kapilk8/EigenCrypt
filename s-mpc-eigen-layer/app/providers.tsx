"use client"

import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from 'wagmi/chains'
import { 
  coinbaseWallet, 
  injected, 
  walletConnect 
} from '@wagmi/connectors'

// Your project's Web3 configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
  connectors: [
    walletConnect({ 
      projectId,
      showQrModal: false 
    }),
    injected(),
    coinbaseWallet({
      appName: 'SMPC EigenLayer'
    })
  ]
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

