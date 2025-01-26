"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { TaskCreationForm } from "@/components/TaskCreationForm"
import { TaskHistoryTable } from "@/components/TaskHistoryTable"
import { ConnectButton } from "@/components/ConnectButton"

export default function Dashboard() {
  const { isConnected } = useAccount()
  const [tasks, setTasks] = useState([])

  const addTask = (newTask) => {
    setTasks([...tasks, newTask])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isConnected ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
              <TaskCreationForm onTaskCreated={addTask} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TaskHistoryTable tasks={tasks} />
            </motion.div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to access the dashboard.</p>
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  )
}

