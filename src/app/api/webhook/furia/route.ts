import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();
    
    console.log('Webhook recebido do FuriaPay:', JSON.stringify(webhookData, null, 2));
    
    // Extrair dados do webhook
    const { type, objectId, data } = webhookData;
    
    if (type === 'transaction' && data) {
      const {
        id,
        status,
        amount,
        paymentMethod,
        customer,
        metadata,
        paidAt,
        refusedReason
      } = data;
      
      // Parse do metadata para obter informações do pedido
      let orderInfo = {};
      try {
        orderInfo = JSON.parse(metadata || '{}');
      } catch (e) {
        console.warn('Erro ao fazer parse do metadata:', e);
      }
      
      console.log('Processando transação:', {
        id,
        status,
        amount: amount / 100, // Converter de centavos para reais
        paymentMethod,
        customerEmail: customer?.email,
        orderInfo,
        paidAt,
        refusedReason
      });
      
      // Aqui você pode implementar a lógica de negócio:
      switch (status) {
        case 'paid':
          console.log(`✅ Pagamento aprovado para transação ${id}`);
          // Implementar: ativar assinatura, enviar email de confirmação, etc.
          break;
          
        case 'refused':
          console.log(`❌ Pagamento recusado para transação ${id}: ${refusedReason}`);
          // Implementar: notificar cliente sobre recusa, etc.
          break;
          
        case 'processing':
          console.log(`⏳ Pagamento em processamento para transação ${id}`);
          // Implementar: aguardar confirmação, etc.
          break;
          
        case 'refunded':
          console.log(`💰 Pagamento estornado para transação ${id}`);
          // Implementar: cancelar assinatura, processar estorno, etc.
          break;
          
        default:
          console.log(`ℹ️ Status desconhecido para transação ${id}: ${status}`);
      }
      
      // Aqui você pode salvar no banco de dados, enviar emails, etc.
      // Exemplo de estrutura para salvar:
      const transactionRecord = {
        furiaPayId: id,
        status,
        amount: amount / 100,
        paymentMethod,
        customerEmail: customer?.email,
        customerName: customer?.name,
        planId: orderInfo.planId,
        planName: orderInfo.planName,
        orderId: orderInfo.orderId,
        paidAt,
        refusedReason,
        processedAt: new Date().toISOString()
      };
      
      console.log('Dados para salvar no banco:', transactionRecord);
      
      // TODO: Implementar salvamento no banco de dados
      // await saveTransactionToDatabase(transactionRecord);
      
      // TODO: Implementar envio de emails
      // if (status === 'paid') {
      //   await sendConfirmationEmail(customer.email, orderInfo);
      // }
    }
    
    // Sempre retornar 200 para confirmar recebimento do webhook
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      received: {
        type,
        objectId,
        status: data?.status
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    // Mesmo com erro, retornar 200 para evitar reenvios desnecessários
    // Em produção, você pode querer retornar 500 para que o FuriaPay reenvie
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao processar webhook: ' + errorMessage,
      error: errorMessage
    }, { status: 200 });
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint do FuriaPay está funcionando',
    timestamp: new Date().toISOString()
  });
}