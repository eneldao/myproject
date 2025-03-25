'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CreditCard, Copy, Check, AlertCircle } from 'lucide-react';
import { saveUserPaymentInfo, createTransaction, validateCCPNumber, validateCCPKey, formatCCPNumber } from '@/utils/payment';

export default function PaymentProcess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ccpNumber: '',
    ccpKey: '',
    holderName: '',
    wilaya: '',
  });

  // Merchant CCP info (you should move this to environment variables)
  const merchantCCP = {
    number: '0023456789',
    key: '42',
    holder: 'Your Company Name',
    wilaya: 'Alger'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate CCP number and key
      const isValidNumber = await validateCCPNumber(formData.ccpNumber);
      const isValidKey = await validateCCPKey(formData.ccpKey);

      if (!isValidNumber) {
        throw new Error('Numéro CCP invalide');
      }
      if (!isValidKey) {
        throw new Error('Clé CCP invalide');
      }
      if (!formData.holderName.trim()) {
        throw new Error('Nom du titulaire requis');
      }
      if (!formData.wilaya.trim()) {
        throw new Error('Wilaya requise');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Save payment info
      const paymentInfo = await saveUserPaymentInfo(
        user.id,
        formData.ccpNumber,
        formData.ccpKey,
        formData.holderName,
        formData.wilaya
      );

      // Create transaction
      const transaction = await createTransaction(
        paymentInfo,
        Number(searchParams.get('price')) || 0,
        searchParams.get('plan') || 'Basic',
        searchParams.get('billing') as 'month' | 'year' || 'month'
      );

      // Redirect to confirmation page
      router.push(`/payment/confirmation?transaction=${transaction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Paiement par CCP</h1>
          <p className="text-gray-300">
            Plan: {searchParams.get('plan')} | 
            Période: {searchParams.get('billing')} | 
            Montant: {searchParams.get('price')} DZD
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions de paiement</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Numéro CCP</span>
                <button
                  onClick={() => copyToClipboard(merchantCCP.number)}
                  className="text-[#00BFFF] hover:text-[#0099CC] flex items-center"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-white text-lg font-medium">{formatCCPNumber(merchantCCP.number)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Clé</span>
                <button
                  onClick={() => copyToClipboard(merchantCCP.key)}
                  className="text-[#00BFFF] hover:text-[#0099CC]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-white text-lg font-medium">{merchantCCP.key}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">Titulaire</p>
              <p className="text-white">{merchantCCP.holder}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">Wilaya</p>
              <p className="text-white">{merchantCCP.wilaya}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Confirmation de paiement</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Votre numéro CCP
              </label>
              <input
                type="text"
                value={formData.ccpNumber}
                onChange={(e) => setFormData({ ...formData, ccpNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="000 000 0000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Votre clé CCP
              </label>
              <input
                type="text"
                value={formData.ccpKey}
                onChange={(e) => setFormData({ ...formData, ccpKey: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du titulaire
              </label>
              <input
                type="text"
                value={formData.holderName}
                onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wilaya
              </label>
              <input
                type="text"
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium bg-[#00BFFF] text-white hover:bg-[#0099CC] transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Traitement...' : 'Confirmer le paiement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 