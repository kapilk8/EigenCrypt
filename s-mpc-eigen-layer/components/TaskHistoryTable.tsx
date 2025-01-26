import type React from "react"
import axios from "axios"
import { useQuery } from "react-query"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Task {
  id: string
  description: string
  status: "Pending" | "Processing" | "Completed"
  reward: string
}

export const TaskHistoryTable: React.FC = () => {
  const fetchTasks = async (): Promise<Task[]> => {
    const response = await axios.get(`${API_URL}/api/tasks`)
    return response.data
  }

  const { data: tasks, isLoading, isError } = useQuery("tasks", fetchTasks)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-500 text-center">Error fetching tasks. Please try again later.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reward (ETH)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks?.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

