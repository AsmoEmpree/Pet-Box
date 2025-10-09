import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔔 Webhook FuriaPay recebido:', {
      event: body.event,
      transactionId: body.transaction?.id,
      status: body.transaction?.status,
      amount: body.transaction?.amount,
      customerEmail: body.transaction?.customer?.email,
      timestamp: new Date().toISOString()
    });

    // Validar se é uma notificação válida do FuriaPay
    if (!body.event || !body.transaction) {
      console.error('❌ Webhook inválido - dados obrigatórios ausentes');
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Processar diferentes tipos de eventos
    switch (body.event) {
      case 'transaction.paid':
        console.log('✅ Pagamento APROVADO:', {
          transactionId: body.transaction.id,
          amount: body.transaction.amount,
          customerEmail: body.transaction.customer?.email
        });
        await handlePaymentApproved(body.transaction);
        break;

      case 'transaction.refused':
        console.log('❌ Pagamento RECUSADO:', {
          transactionId: body.transaction.id,
          reason: body.transaction.refuse_reason,
          customerEmail: body.transaction.customer?.email
        });
        await handlePaymentRefused(body.transaction);
        break;

      case 'transaction.pending':
        console.log('⏳ Pagamento PENDENTE:', {
          transactionId: body.transaction.id,
          paymentMethod: body.transaction.payment_method,
          customerEmail: body.transaction.customer?.email
        });
        await handlePaymentPending(body.transaction);
        break;

      case 'transaction.chargedback':
        console.log('⚠️ CHARGEBACK detectado:', {
          transactionId: body.transaction.id,
          amount: body.transaction.amount,
          customerEmail: body.transaction.customer?.email
        });
        await handleChargeback(body.transaction);
        break;

      default:
        console.log(`❓ Evento não tratado: ${body.event}`);
    }

    // Sempre retornar 200 para confirmar recebimento
    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Erro crítico no webhook FuriaPay:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Retornar 500 para que o FuriaPay tente reenviar
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Função para processar pagamento aprovado
async function handlePaymentApproved(transaction: any) {
  try {
    console.log('🎉 Processando pagamento aprovado:', transaction.id);
    
    // Extrair metadata do pedido
    const metadata = transaction.metadata || {};
    const planId = metadata.planId;
    const planName = metadata.planName;
    const customerEmail = transaction.customer?.email;
    const customerName = transaction.customer?.name;

    if (customerEmail && planId) {
      // AQUI VOCÊ DEVE INTEGRAR COM SEU SISTEMA:
      // 1. Ativar assinatura do cliente no banco de dados
      // 2. Enviar email de boas-vindas
      // 3. Criar perfil do cliente
      // 4. Agendar primeira entrega
      
      console.log('🚀 AÇÃO NECESSÁRIA - Ativar assinatura:', {
        transactionId: transaction.id,
        planId,
        planName,
        customerEmail,
        customerName,
        amount: transaction.amount / 100, // Converter centavos para reais
        timestamp: new Date().toISOString()
      });

      // TODO: Implementar integração com seu sistema de assinaturas
      // Exemplo:
      // await activateSubscription({
      //   customerId: customerEmail,
      //   planId: planId,
      //   transactionId: transaction.id,
      //   startDate: new Date()
      // });
      
      // TODO: Enviar email de confirmação
      // await sendWelcomeEmail(customerEmail, customerName, planName);
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
  }
}

// Função para processar pagamento recusado
async function handlePaymentRefused(transaction: any) {
  try {
    console.log('❌ Processando pagamento recusado:', transaction.id);
    
    const customerEmail = transaction.customer?.email;
    const customerName = transaction.customer?.name;
    const refusalReason = transaction.refuse_reason;

    if (customerEmail) {
      console.log('📧 AÇÃO NECESSÁRIA - Notificar cliente sobre recusa:', {
        transactionId: transaction.id,
        customerEmail,
        customerName,
        reason: refusalReason,
        timestamp: new Date().toISOString()
      });

      // TODO: Enviar email ou notificação sobre a recusa
      // await sendPaymentRefusedEmail(customerEmail, customerName, refusalReason);
      
      // TODO: Sugerir métodos alternativos de pagamento
      // await suggestAlternativePaymentMethods(customerEmail);
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento recusado:', error);
  }
}

// Função para processar pagamento pendente
async function handlePaymentPending(transaction: any) {
  try {
    console.log('⏳ Processando pagamento pendente:', transaction.id);
    
    const customerEmail = transaction.customer?.email;
    const customerName = transaction.customer?.name;
    const paymentMethod = transaction.payment_method;

    if (customerEmail) {
      if (paymentMethod === 'pix') {
        console.log('💰 PIX pendente - aguardando pagamento:', {
          transactionId: transaction.id,
          customerEmail,
          customerName,
          timestamp: new Date().toISOString()
        });
        
        // TODO: Enviar instruções de pagamento PIX
        // await sendPixInstructions(customerEmail, transaction.pix_code, transaction.pix_qr_code);
        
      } else if (paymentMethod === 'boleto') {
        console.log('🧾 Boleto pendente - aguardando pagamento:', {
          transactionId: transaction.id,
          customerEmail,
          customerName,
          timestamp: new Date().toISOString()
        });
        
        // TODO: Enviar boleto por email
        // await sendBoletoEmail(customerEmail, transaction.boleto_url);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento pendente:', error);
  }
}

// Função para processar chargeback
async function handleChargeback(transaction: any) {
  try {
    console.log('⚠️ Processando chargeback:', transaction.id);
    
    const customerEmail = transaction.customer?.email;
    const customerName = transaction.customer?.name;

    if (customerEmail) {
      console.log('🚨 AÇÃO URGENTE - Chargeback detectado:', {
        transactionId: transaction.id,
        customerEmail,
        customerName,
        amount: transaction.amount / 100,
        timestamp: new Date().toISOString()
      });

      // TODO: Suspender assinatura imediatamente
      // await suspendSubscription(customerEmail, 'chargeback');
      
      // TODO: Notificar equipe de suporte
      // await notifySupportTeam('chargeback', transaction);
      
      // TODO: Iniciar processo de contestação se necessário
      // await initiateChargebackDispute(transaction.id);
    }
  } catch (error) {
    console.error('❌ Erro ao processar chargeback:', error);
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Este endpoint aceita apenas requisições POST do FuriaPay'
    },
    { status: 405 }
  );
}