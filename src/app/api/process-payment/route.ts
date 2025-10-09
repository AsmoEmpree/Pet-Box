import { NextRequest, NextResponse } from 'next/server';
import { furiaPayConfig, FuriaPayTransaction, FuriaPayError } from '@/lib/furiaPayConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica dos dados recebidos
    if (!body.amount || !body.paymentMethod || !body.customer) {
      return NextResponse.json(
        { success: false, message: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verificar se as chaves do FuriaPay estão configuradas
    if (!furiaPayConfig.isConfigured()) {
      console.error('ERRO CRÍTICO: Chaves do FuriaPay não configuradas!');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sistema de pagamento não configurado. Entre em contato com o suporte.',
          error: 'payment_not_configured'
        },
        { status: 503 }
      );
    }

    // Log dos dados recebidos para debug (sem dados sensíveis)
    console.log('Processando pagamento:', {
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      customerEmail: body.customer?.email,
      environment: furiaPayConfig.environment,
      timestamp: new Date().toISOString()
    });

    // Preparar payload para o FuriaPay
    const furiaPayload = {
      amount: body.amount,
      payment_method: body.paymentMethod,
      installments: body.installments || 1,
      postback_url: body.postbackUrl || `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/api/webhook/furia`,
      metadata: body.metadata ? JSON.parse(body.metadata) : {},
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone || '',
        document: {
          type: body.customer.document?.type || 'cpf',
          number: body.customer.document?.number?.replace(/\D/g, '') || ''
        },
        address: body.customer.address || {}
      },
      items: body.items || []
    };

    // Adicionar dados do cartão se for pagamento com cartão
    if (body.paymentMethod === 'credit_card' && body.card) {
      furiaPayload.card = {
        number: body.card.number.replace(/\s/g, ''),
        holder_name: body.card.holderName.toUpperCase(),
        expiration_month: parseInt(body.card.expirationMonth),
        expiration_year: parseInt(body.card.expirationYear),
        cvv: body.card.cvv
      };
    }

    const apiUrl = `${furiaPayConfig.apiUrl}/transactions`;
    
    console.log('Enviando para FuriaPay:', {
      url: apiUrl,
      method: 'POST',
      amount: furiaPayload.amount,
      payment_method: furiaPayload.payment_method,
      environment: furiaPayConfig.environment,
      timestamp: new Date().toISOString()
    });

    // Fazer requisição para o FuriaPay
    const furiaResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: furiaPayConfig.getApiHeaders(),
      body: JSON.stringify(furiaPayload)
    });

    let furiaData: FuriaPayTransaction | FuriaPayError;
    
    try {
      furiaData = await furiaResponse.json();
    } catch (parseError) {
      console.error('Erro ao parsear resposta do FuriaPay:', parseError);
      throw new Error('Resposta inválida do gateway de pagamento');
    }
    
    console.log('Resposta do FuriaPay:', {
      status: furiaResponse.status,
      success: furiaResponse.ok,
      transactionId: furiaResponse.ok ? (furiaData as FuriaPayTransaction).id : 'N/A',
      timestamp: new Date().toISOString()
    });

    if (!furiaResponse.ok) {
      const errorData = furiaData as FuriaPayError;
      console.error('Erro na API do FuriaPay:', {
        status: furiaResponse.status,
        error: errorData.error,
        message: errorData.message,
        timestamp: new Date().toISOString()
      });
      
      // Mapear erros específicos do FuriaPay
      let errorMessage = 'Erro no processamento do pagamento';
      
      if (furiaResponse.status === 400) {
        errorMessage = 'Dados do pagamento inválidos. Verifique as informações e tente novamente.';
      } else if (furiaResponse.status === 401) {
        errorMessage = 'Erro de autenticação com o gateway. Entre em contato com o suporte.';
      } else if (furiaResponse.status === 402) {
        errorMessage = 'Pagamento recusado. Verifique os dados do cartão ou tente outro método.';
      } else if (furiaResponse.status === 429) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      } else if (furiaResponse.status >= 500) {
        errorMessage = 'Erro temporário no gateway. Tente novamente em alguns minutos.';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || errorMessage,
          error: errorData.error || 'gateway_error'
        },
        { status: furiaResponse.status }
      );
    }

    const transactionData = furiaData as FuriaPayTransaction;

    // Processar resposta de sucesso do FuriaPay
    const responseData = {
      success: true,
      status: transactionData.status,
      transactionId: transactionData.id,
      message: 'Pagamento processado com sucesso'
    };

    // Para PIX, incluir dados de pagamento
    if (body.paymentMethod === 'pix') {
      if (transactionData.pix_qr_code) {
        responseData.pixQrCode = transactionData.pix_qr_code;
      }
      if (transactionData.pix_code) {
        responseData.pixCode = transactionData.pix_code;
      }
    }

    // Para cartão com 3DS, incluir URL segura
    if (transactionData.secure_url) {
      responseData.secureUrl = transactionData.secure_url;
    }

    // Log de sucesso para monitoramento
    console.log('PAYMENT_PROCESSED_SUCCESS', {
      transactionId: transactionData.id,
      status: transactionData.status,
      amount: transactionData.amount,
      paymentMethod: transactionData.payment_method,
      customerEmail: transactionData.customer.email,
      environment: furiaPayConfig.environment,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Erro crítico no processamento do pagamento:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Verificar se é erro de rede/conectividade
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro de conectividade com o gateway de pagamento. Verifique sua conexão e tente novamente.',
          error: 'network_error'
        },
        { status: 503 }
      );
    }
    
    // Erro genérico
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: 'internal_error'
      },
      { status: 500 }
    );
  }
}