"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { adminApi } from '@/utils/api';
import { logout } from '@/utils/auth';

interface Task {
  _id: string;
  description: string;
  status: string;
  reward: number;
  createdAt: string;
  createdBy: { address: string };
}

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!userInfo?.isAdmin) {
          router.push('/login');
          return;
        }

        const response = await adminApi.getAllTasks();
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tasks');
        setLoading(false);
      }
    };

    if (!userInfo) {
      router.push('/login');
    } else {
      fetchTasks();
    }
  }, [userInfo, router]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await adminApi.updateTaskStatus(taskId, newStatus);
      // Refresh tasks after update
      const response = await adminApi.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const handleClaimReward = async (taskId: string) => {
    try {
      await adminApi.claimReward(taskId);
      // Refresh tasks after claiming reward
      const response = await adminApi.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to claim reward');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!userInfo?.isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Admin: {userInfo.address.substring(0, 6)}...{userInfo.address.substring(userInfo.address.length - 4)}
          </span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">All Tasks</h2>
        </div>

        {loading ? (
          <div className="text-center py-6">Loading tasks...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-6">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No tasks found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-left">Creator</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Reward</th>
                <th className="py-3 px-6 text-left">Created At</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {tasks.map((task) => (
                <tr key={task._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{task.description}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {task.createdBy.address.substring(0, 6)}...{task.createdBy.address.substring(task.createdBy.address.length - 4)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                      className={`
                        px-3 py-1 rounded-full text-xs 
                        ${task.status === 'completed' ? 'bg-green-200 text-green-800' : 
                          task.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-red-200 text-red-800'}
                      `}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {task.reward} ETH
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {task.status === 'completed' && (
                      <button 
                        onClick={() => handleClaimReward(task._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Claim Reward
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

