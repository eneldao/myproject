'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle2, CreditCard } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Basic',
    price: 3900,
    description: 'Parfait pour les freelances débutants',
    features: [
      'Profil de base',
      '5 projets actifs',
      'Support par email',
      'Statistiques de base',
    ],
  },
  {
    name: 'Professional',
    price: 6900,
    description: 'Idéal pour les freelances actifs',
    features: [
      'Profil premium',
      'Projets illimités',
      'Support prioritaire',
      'Statistiques avancées',
      'Badges de vérification',
      'Mise en avant du profil',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 12900,
    description: 'Pour les freelances établis',
    features: [
      'Profil enterprise',
      'Projets illimités',
      'Support 24/7',
      'Statistiques détaillées',
      'Badges de vérification',
      'Mise en avant maximale',
      'API access',
      'Fonctionnalités personnalisées',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
    }).format(price);
  };

  const handleSubscribe = async (plan: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      router.push('/payment/process');
    } else {
      router.push(`/auth/register?plan=${plan}&billing=${billingPeriod}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-gray-300">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          <span className={`text-lg ${billingPeriod === 'month' ? 'text-white' : 'text-gray-400'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'month' ? 'year' : 'month')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:ring-offset-2 ${
              billingPeriod === 'year' ? 'bg-[#00BFFF]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-lg ${billingPeriod === 'year' ? 'text-white' : 'text-gray-400'}`}>
            Annuel
            <span className="text-[#00BFFF] ml-2">-20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => {
            const yearlyPrice = Math.round(plan.price * 0.8);
            const price = billingPeriod === 'year' ? yearlyPrice : plan.price;
            
            return (
              <div
                key={plan.name}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 relative ${
                  plan.recommended
                    ? 'border border-[#00BFFF] shadow-lg scale-105'
                    : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#00BFFF] text-white px-3 py-1 rounded-full text-sm">
                      Recommandé
                    </span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{formatPrice(price)}</span>
                  <span className="text-gray-300">/mois</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-[#00BFFF] mr-2" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    className="w-full py-3 rounded-lg font-medium bg-[#00BFFF] text-white hover:bg-[#0099CC] transition-colors"
                  >
                    S'abonner maintenant
                  </button>
                  <button
                    onClick={() => router.push(`/payment/process?plan=${plan.name}&billing=${billingPeriod}&price=${price}`)}
                    className="w-full py-3 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer directement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 