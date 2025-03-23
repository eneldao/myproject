'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowUp, FaArrowDown, FaFilter, FaSearch, FaChartBar, FaUser, FaCalendar } from 'react-icons/fa';
import type { Transaction } from '@/lib/supabase';

type Statistics = {
  totalTransactions: number;
  totalAmount: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
};

export default function AdminTransactionsPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [filter, dateRange, user?.id]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/transactions?type=${filter}&start=${dateRange.start}&end=${dateRange.end}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setStatistics(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.sender?.full_name?.toLowerCase().includes(searchLower) ||
      transaction.receiver?.full_name?.toLowerCase().includes(searchLower) ||
      transaction.project?.title.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || profile?.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Transaction Management</h1>
            <div className="flex items-center gap-4">
              <FaChartBar className="text-[#00BFFF] text-2xl" />
              <span className="text-white text-lg">Admin Dashboard</span>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-[#00BFFF]" />
                  <span className="text-white">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold text-white">{statistics.totalTransactions}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartBar className="text-[#00BFFF]" />
                  <span className="text-white">Total Amount</span>
                </div>
                <p className="text-2xl font-bold text-white">${statistics.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowUp className="text-green-400" />
                  <span className="text-white">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{statistics.completedTransactions}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowDown className="text-yellow-400" />
                  <span className="text-white">Pending</span>
                </div>
                <p className="text-2xl font-bold text-white">{statistics.pendingTransactions}</p>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:border-[#00BFFF]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <FaCalendar className="text-[#00BFFF]" />
                <input
                  type="date"
                  className="bg-white/5 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00BFFF]"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="bg-white/5 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00BFFF]"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <button
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-[#00BFFF] text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filter === 'sent'
                    ? 'bg-[#00BFFF] text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
                onClick={() => setFilter('sent')}
              >
                <FaArrowUp />
                Sent
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filter === 'received'
                    ? 'bg-[#00BFFF] text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
                onClick={() => setFilter('received')}
              >
                <FaArrowDown />
                Received
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {isLoading ? (
            <div className="text-center text-white">Loading transactions...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center text-white">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">
                          {transaction.sender_id === user.id ? (
                            <FaArrowUp className="text-red-400" />
                          ) : (
                            <FaArrowDown className="text-green-400" />
                          )}
                          {transaction.sender_id === user.id
                            ? `Sent to ${transaction.receiver?.full_name}`
                            : `Received from ${transaction.sender?.full_name}`}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Project: {transaction.project?.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 