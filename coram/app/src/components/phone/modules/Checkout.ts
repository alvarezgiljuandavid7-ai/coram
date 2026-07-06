import { useState } from 'react';

export const checkoutTargets = ['membership', 'courses', 'corarios', 'resources', 'mentorships', 'hymnarios', 'warmups', 'tuner_piano'] as const;

type PaymentMethod = 'card' | 'paypal' | 'whatsapp';

interface UseCheckoutModuleOptions {
  getSectionPrice: (sectionId: string) => string;
  showToast: (message: string) => void;
}

export function useCheckoutModule({ getSectionPrice, showToast }: UseCheckoutModuleOptions) {
  const [showCartCheckout, setShowCartCheckout] = useState<boolean>(false);
  const [checkoutItemName, setCheckoutItemName] = useState<string>('');
  const [checkoutItemPrice, setCheckoutItemPrice] = useState<string>('');
  const [checkoutTargetId, setCheckoutTargetId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [checkoutProcessing, setCheckoutProcessing] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  const handleOpenCheckout = (sectionId: string, sectionName: string) => {
    setCheckoutTargetId(sectionId);
    setCheckoutItemName(sectionName);
    setCheckoutItemPrice(getSectionPrice(sectionId));
    setPaymentMethod('card');
    setCardNumber('');
    setCardName('');
    setCheckoutProcessing(false);
    setCheckoutSuccess(false);
    setShowCartCheckout(true);
  };

  const handleUnavailablePayment = () => {
    showToast('El pago real requiere Stripe activo. No se habilito Premium automaticamente.');
  };

  return {
    showCartCheckout,
    setShowCartCheckout,
    checkoutItemName,
    checkoutItemPrice,
    checkoutTargetId,
    paymentMethod,
    setPaymentMethod,
    cardNumber,
    setCardNumber,
    cardName,
    setCardName,
    checkoutProcessing,
    checkoutSuccess,
    handleOpenCheckout,
    handleUnavailablePayment,
  };
}
