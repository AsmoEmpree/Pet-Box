// Configurações do FuriaPay para PRODUÇÃO
export const furiaPayConfig = {
  // Chaves de API - OBRIGATÓRIO configurar no .env.local
  publicKey: process.env.NEXT_PUBLIC_FURIA_PUBLIC_KEY || '',
  secretKey: process.env.FURIA_SECRET_KEY || '',
  
  // URLs da API - PRODUÇÃO
  apiUrl: process.env.FURIA_ENVIRONMENT === 'test' 
    ? 'https://api.furiapaybr.com/v1' 
    : 'https://api.furiapaybr.com/v1',
  
  // Script do SDK
  sdkUrl: 'https://api.furiapaybr.com/v1/js',
  
  // Configurações de webhook
  webhookUrl: process.env.FURIA_WEBHOOK_URL,
  
  // Ambiente - PRODUÇÃO por padrão
  environment: process.env.FURIA_ENVIRONMENT || 'production',
  
  // Validar se as chaves estão configuradas
  isConfigured(): boolean {
    return Boolean(this.publicKey && this.secretKey && this.publicKey.length > 10 && this.secretKey.length > 10);
  },
  
  // Obter headers para requisições à API
  getApiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`,
      'User-Agent': 'PetBox/1.0'
    };
  },
  
  // Validar chave pública
  isValidPublicKey(key: string): boolean {
    return key.startsWith('pk_') && key.length > 10;
  },
  
  // Validar chave secreta
  isValidSecretKey(key: string): boolean {
    return key.startsWith('sk_') && key.length > 10;
  }
};

// Tipos para o FuriaPay
export interface FuriaPayTransaction {
  id: string;
  status: 'pending' | 'paid' | 'refused' | 'chargedback' | 'processing';
  amount: number;
  payment_method: 'credit_card' | 'pix' | 'boleto';
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
  secure_url?: string;
  pix_qr_code?: string;
  pix_code?: string;
  refuse_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface FuriaPayWebhook {
  event: 'transaction.paid' | 'transaction.refused' | 'transaction.pending' | 'transaction.chargedback';
  transaction: FuriaPayTransaction;
  timestamp: string;
}

export interface FuriaPayError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Utilitários para formatação
export const furiaPayUtils = {
  // Converter preço brasileiro para centavos
  priceToCents(priceString: string): number {
    if (!priceString || typeof priceString !== 'string') {
      return 0;
    }
    const numericString = priceString.replace('R$ ', '').replace(',', '.');
    const price = parseFloat(numericString);
    return isNaN(price) ? 0 : Math.round(price * 100);
  },
  
  // Converter centavos para preço brasileiro
  centsToPrice(cents: number): string {
    const price = cents / 100;
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  },
  
  // Formatar CPF/CNPJ
  formatDocument(document: string): string {
    const cleaned = document.replace(/\D/g, '');
    if (cleaned.length === 11) {
      // CPF
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      // CNPJ
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return document;
  },
  
  // Validar CPF
  isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned[9]) !== digit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned[10]) !== digit) return false;
    
    return true;
  },
  
  // Formatar número de cartão
  formatCardNumber(value: string): string {
    if (!value || typeof value !== 'string') return '';
    
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : v;
  }
};