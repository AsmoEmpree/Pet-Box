import { NextRequest, NextResponse } from 'next/server';

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

    // Log dos dados recebidos para debug
    console.log('Dados do pagamento recebidos:', {
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      customerEmail: body.customer?.email,
      metadata: body.metadata
    });

    // Simular processamento de pagamento
    // Em produção, aqui você faria a integração real com o FuriaPay
    const mockPaymentResponse = {
      success: true,
      status: 'paid',
      transactionId: `txn_${Date.now()}`,
      message: 'Pagamento processado com sucesso'
    };

    // Para PIX, simular redirecionamento
    if (body.paymentMethod === 'pix') {
      mockPaymentResponse.status = 'pending';
      // @ts-ignore
      mockPaymentResponse.secureUrl = `https://checkout.furiapaybr.com/pix/${Date.now()}`;
    }

    return NextResponse.json(mockPaymentResponse);

  } catch (error) {
    console.error('Erro no processamento do pagamento:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    );
  }
}