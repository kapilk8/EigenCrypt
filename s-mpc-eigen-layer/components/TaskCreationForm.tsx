import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useMutation } from "react-query"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface TaskCreationFormProps {
  onTaskCreated: () => void
}

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({ onTaskCreated }) => {
  const [description, setDescription] = useState("")
  const [parameters, setParameters] = useState("")
  const [reward, setReward] = useState("")

  const createTask = async (taskData: any) => {
    const response = await axios.post(`${API_URL}/api/tasks/create`, taskData)
    return response.data
  }

  const mutation = useMutation(createTask, {
    onSuccess: () => {
      onTaskCreated()
      setDescription("")
      setParameters("")
      setReward("")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ description, parameters: JSON.parse(parameters), reward })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div>
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Task Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div>
        <label htmlFor="parameters" className="block text-gray-700 text-sm font-bold mb-2">
          Computation Parameters (JSON)
        </label>
        <textarea
          id="parameters"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div>
        <label htmlFor="reward" className="block text-gray-700 text-sm font-bold mb-2">
          ETH Reward
        </label>
        <input
          type="number"
          id="reward"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          step="0.001"
          min="0"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Creating..." : "Create Task"}
      </button>
      {mutation.isError && <div className="text-red-500 text-sm mt-2">Error creating task. Please try again.</div>}
      {mutation.isSuccess && <div className="text-green-500 text-sm mt-2">Task created successfully!</div>}
    </form>
  )
}

