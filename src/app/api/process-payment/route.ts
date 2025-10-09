import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Configuração das chaves do FuriaPay
    const publicKey = process.env.NEXT_PUBLIC_FURIA_PUBLIC_KEY;
    const secretKey = process.env.FURIA_SECRET_KEY;
    
    if (!publicKey || !secretKey) {
      console.error('Chaves de API não configuradas');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chaves de API não configuradas. Configure NEXT_PUBLIC_FURIA_PUBLIC_KEY e FURIA_SECRET_KEY no arquivo .env.local' 
        },
        { status: 500 }
      );
    }

    // URL da API do FuriaPay
    const url = 'https://api.furiapaybr.com/v1/transactions';
    
    // Autenticação Basic Auth
    const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');

    console.log('Processando pagamento:', {
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      customerEmail: payload.customer?.email
    });

    // Fazer requisição para o FuriaPay
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro HTTP FuriaPay:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro na API do FuriaPay: ${response.status} ${response.statusText}`,
          error: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Pagamento processado com sucesso:', {
      id: data.id,
      status: data.status,
      paymentMethod: data.paymentMethod
    });

    // Sucesso - retornar dados da transação
    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      secureUrl: data.secureUrl,
      secureId: data.secureId,
      message: 'Transação processada com sucesso'
    });

  } catch (error) {
    console.error('Erro no processamento do pagamento:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}