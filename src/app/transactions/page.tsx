'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowUp, FaArrowDown, FaFilter, FaSearch } from 'react-icons/fa';
type Transaction = {
  id: string;
  sender_id: string;
  receiver_id: string;
  project: { title: string } | null;
  sender: { full_name: string } | null;
  receiver: { full_name: string } | null;
  amount: number;
  status: string;
  created_at: string;
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [filter, user?.id]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/transactions?userId=${user?.id}&type=${filter}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.sender?.full_name.toLowerCase().includes(searchLower) ||
      transaction.receiver?.full_name.toLowerCase().includes(searchLower) ||
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view transactions</h1>
          <a href="/auth/signin" className="text-[#00BFFF] hover:text-[#0099CC]">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Transaction History</h1>

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
            <div className="text-center text-red-400">{error}</div>
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