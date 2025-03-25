'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Paiement réussi !
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Votre abonnement a été activé avec succès.
          </p>
        </div>
        <div className="mt-8">
          <Button
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Aller au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
} 