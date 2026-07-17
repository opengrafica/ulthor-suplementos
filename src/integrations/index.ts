/**
 * Integrações futuras - ULTHOR SUPLEMENTOS
 * Estrutura preparada para implementação posterior
 */

export const paymentIntegrations = {
  mercadoPago: {
    enabled: false,
    init: () => console.info('[Future] Mercado Pago integration'),
  },
  stripe: {
    enabled: false,
    init: () => console.info('[Future] Stripe integration'),
  },
  pix: {
    enabled: false,
    generateQRCode: (_amount: number) => console.info('[Future] PIX QR Code'),
  },
}

export const shippingIntegrations = {
  /** Cálculo por região/CEP — ver src/lib/shipping.ts */
  correios: {
    enabled: true,
  },
  melhorEnvio: {
    enabled: false,
  },
}

export const notificationIntegrations = {
  whatsapp: {
    enabled: false,
    sendOrderUpdate: (_phone: string, _message: string) => {},
  },
  email: {
    enabled: false,
    sendOrderConfirmation: (_email: string, _orderId: string) => {},
  },
  push: {
    enabled: false,
    send: (_userId: string, _title: string, _body: string) => {},
  },
}

export const loyaltyProgram = {
  enabled: false,
  calculatePoints: (_amount: number) => 0,
  redeemPoints: (_userId: string, _points: number) => {},
}

export const couponSystem = {
  enabled: false,
  validate: (_code: string) => null as { discount: number; type: 'percent' | 'fixed' } | null,
}

export const affiliateProgram = {
  enabled: false,
  trackReferral: (_code: string, _userId: string) => {},
}

export const mobileApp = {
  enabled: false,
  apiVersion: 'v1',
}
