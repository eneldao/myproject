'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentError() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Erreur de paiement
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Une erreur est survenue lors du traitement de votre paiement.
            Veuillez réessayer ou contacter le support.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push('/payment')}
          >
            Réessayer
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/contact')}
          >
            Contacter le support
          </Button>
        </div>
      </div>
    </div>
  );
} 