'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentInfo() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Méthodes de paiement disponibles</h2>
      <div className="grid gap-4 text-left">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
          <div>
            <h3 className="font-medium">Cartes bancaires</h3>
            <p className="text-sm text-gray-600">CIB, BNA, BDL</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
          <div>
            <h3 className="font-medium">CEP (Carte Electronique de Paiement)</h3>
            <p className="text-sm text-gray-600">Paiement sécurisé par carte électronique</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
          <div>
            <h3 className="font-medium">Mobile Money</h3>
            <p className="text-sm text-gray-600">Djezzy, Ooredoo</p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button
          onClick={() => router.push('/payment/process')}
          className="w-full"
        >
          Procéder au paiement
        </Button>
      </div>
    </div>
  );
} 