"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

type Task = {
  id: string
  description: string
  status: "Pending" | "Processing" | "Completed"
  reward: string
}

export function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { isConnected, address } = useAccount()

  useEffect(() => {
    if (isConnected) {
      // TODO: Fetch tasks from the backend or smart contract
      const mockTasks: Task[] = [
        { id: "1", description: "Sample Task 1", status: "Pending", reward: "0.1" },
        { id: "2", description: "Sample Task 2", status: "Processing", reward: "0.2" },
        { id: "3", description: "Sample Task 3", status: "Pending", reward: "0.3" },
      ]
      setTasks(mockTasks)
    }
  }, [isConnected])

  const handleCompleteTask = (taskId: string) => {
    // TODO: Implement task completion logic
    console.log(`Completing task ${taskId}`)
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "Completed" as const } : task)))
  }

  if (!isConnected) {
    return <p className="text-red-500">Please connect your wallet to access the admin dashboard.</p>
  }

  // TODO: Implement proper admin check
  const isAdmin = address === "0x1234567890123456789012345678901234567890"

  if (!isAdmin) {
    return <p className="text-red-500">You do not have admin access.</p>
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Admin Task Management</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Reward (ETH)
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{task.id}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{task.description}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{task.reward}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                {task.status !== "Completed" && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Mark as Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

