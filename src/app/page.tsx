'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Star, Package, Menu, X, User, LogOut, CheckCircle, CreditCard, Lock, Calendar } from 'lucide-react';

// Declaração global para o FuriaPay
declare global {
  interface Window {
    FuriaPay?: {
      setPublicKey: (key: string) => void;
    };
  }
}

export default function PetBoxHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    tutorName: '',
    email: '',
    password: '',
    petName: '',
    petType: '',
    petAge: '',
    petSize: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: ''
  });

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    zipCode: '',
    street: '',
    streetNumber: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Carregar script do FuriaPay e configurar chave pública
  useEffect(() => {
    const loadFuriaPayScript = () => {
      // Verificar se o script já foi carregado
      if (window.FuriaPay || scriptLoaded) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.furiapaybr.com/v1/js';
      script.async = true;
      
      script.onload = () => {
        try {
          setScriptLoaded(true);
          if (window.FuriaPay && process.env.NEXT_PUBLIC_FURIA_PUBLIC_KEY) {
            window.FuriaPay.setPublicKey(process.env.NEXT_PUBLIC_FURIA_PUBLIC_KEY);
            console.log('FuriaPay script carregado com sucesso');
          } else {
            console.warn('FuriaPay não disponível ou chave pública não configurada');
          }
        } catch (error) {
          console.error('Erro ao configurar FuriaPay:', error);
        }
      };
      
      script.onerror = (error) => {
        console.error('Erro ao carregar script do FuriaPay:', error);
        setScriptLoaded(false);
      };

      document.head.appendChild(script);
    };

    loadFuriaPayScript();

    return () => {
      // Cleanup não é necessário pois o script deve permanecer carregado
    };
  }, [scriptLoaded]);

  // Função para converter preço brasileiro para centavos
  const parsePriceToCents = (priceString) => {
    try {
      const numericString = priceString.replace('R$ ', '').replace(',', '.');
      const price = parseFloat(numericString);
      return Math.round(price * 100);
    } catch (error) {
      console.error('Erro ao converter preço:', error);
      return 0;
    }
  };

  // Função para formatar número do cartão
  const formatCardNumber = (value) => {
    try {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        return parts.join(' ');
      } else {
        return v;
      }
    } catch (error) {
      console.error('Erro ao formatar número do cartão:', error);
      return value;
    }
  };

  // Função para processar pagamento com cartão de crédito
  const processCardPayment = async (plan) => {
    setIsProcessingPayment(true);
    
    try {
      const amount = parsePriceToCents(plan.price);
      
      // Validar dados obrigatórios
      if (!cardData.number || !cardData.holderName || !cardData.expirationMonth || 
          !cardData.expirationYear || !cardData.cvv) {
        throw new Error('Por favor, preencha todos os dados do cartão.');
      }

      if (!customerData.name || !customerData.email || !customerData.document) {
        throw new Error('Por favor, preencha os dados pessoais obrigatórios.');
      }

      const payload = {
        amount,
        paymentMethod: 'credit_card',
        installments: 1,
        postbackUrl: `${window.location.origin}/api/webhook/furia`,
        metadata: JSON.stringify({ 
          planId: plan.id,
          planName: plan.name,
          orderId: `order_${Date.now()}`
        }),
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          document: {
            type: 'cpf',
            number: customerData.document.replace(/\D/g, '')
          },
          address: {
            street: customerData.street || '',
            streetNumber: customerData.streetNumber || '',
            zipCode: customerData.zipCode?.replace(/\D/g, '') || '',
            neighborhood: customerData.neighborhood || '',
            city: customerData.city || '',
            state: customerData.state || '',
            country: 'BR'
          }
        },
        card: {
          number: cardData.number.replace(/\s/g, ''),
          holderName: cardData.holderName.toUpperCase(),
          expirationMonth: parseInt(cardData.expirationMonth),
          expirationYear: parseInt(cardData.expirationYear),
          cvv: cardData.cvv
        },
        items: [{
          externalRef: plan.id,
          title: `${plan.name} - Assinatura Mensal PetBox`,
          unitPrice: amount,
          quantity: 1,
          tangible: true
        }]
      };

      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (data.status === 'paid') {
          alert('Pagamento aprovado! Bem-vindo à PetBox!');
          setShowPaymentModal(false);
        } else if (data.status === 'processing') {
          alert('Pagamento em processamento. Você receberá uma confirmação em breve.');
          setShowPaymentModal(false);
        } else if (data.secureUrl) {
          // Redirecionar para autenticação 3DS se necessário
          window.location.href = data.secureUrl;
        }
      } else {
        throw new Error(data.message || 'Erro no processamento do pagamento');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento. Verifique sua conexão e tente novamente.';
      alert(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Função para processar pagamento PIX
  const processPixPayment = async (plan) => {
    setIsProcessingPayment(true);
    
    try {
      const amount = parsePriceToCents(plan.price);
      
      if (!customerData.name || !customerData.email || !customerData.document) {
        throw new Error('Por favor, preencha os dados pessoais obrigatórios.');
      }

      const payload = {
        amount,
        paymentMethod: 'pix',
        postbackUrl: `${window.location.origin}/api/webhook/furia`,
        metadata: JSON.stringify({ 
          planId: plan.id,
          planName: plan.name,
          orderId: `order_${Date.now()}`
        }),
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          document: {
            type: 'cpf',
            number: customerData.document.replace(/\D/g, '')
          }
        },
        items: [{
          externalRef: plan.id,
          title: `${plan.name} - Assinatura Mensal PetBox`,
          unitPrice: amount,
          quantity: 1,
          tangible: true
        }]
      };

      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.secureUrl) {
        // Redirecionar para página de pagamento PIX
        window.location.href = data.secureUrl;
      } else {
        throw new Error(data.message || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('Erro no PIX:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar PIX. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const plans = [
    {
      id: 'basico',
      name: 'Plano Básico',
      price: 'R$ 39,90',
      description: 'Perfeito para começar a aventura',
      features: [
        '3-4 produtos por mês',
        '1 roupa temática',
        '2 brinquedos',
        '1 acessório',
        'Entrega grátis',
        'Suporte por email'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 'R$ 59,90',
      description: 'A escolha mais popular dos tutores',
      features: [
        '5-6 produtos por mês',
        '2 roupas temáticas',
        '2-3 brinquedos',
        '2 acessórios',
        'Entrega expressa grátis',
        'Suporte prioritário',
        'Personalização avançada'
      ],
      popular: true
    },
    {
      id: 'deluxe',
      name: 'Plano Deluxe',
      price: 'R$ 89,90',
      description: 'Experiência completa e exclusiva',
      features: [
        '7-8 produtos premium',
        '3 roupas temáticas',
        '3-4 brinquedos',
        '3 acessórios exclusivos',
        'Entrega expressa grátis',
        'Suporte VIP 24/7',
        'Personalização total'
      ],
      popular: false
    },
    {
      id: 'ultimate',
      name: 'Plano Ultimate',
      price: 'R$ 231,90',
      description: 'O máximo em luxo e exclusividade',
      features: [
        '12-15 produtos ultra premium',
        '5 roupas de grife exclusivas',
        '5-6 brinquedos importados',
        '4 acessórios de luxo',
        'Entrega expressa prioritária',
        'Concierge pessoal 24/7',
        'Personalização completa'
      ],
      popular: false
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    
    try {
      if (loginData.email === 'admin@petbox.com' && loginData.password === 'admin123') {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        return;
      }
      
      if (loginData.email && loginData.password) {
        setIsLoggedIn(true);
        setIsAdmin(false);
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    try {
      if (registerData.tutorName && registerData.email && registerData.password && registerData.petName) {
        setIsLoggedIn(true);
        setIsAdmin(false);
        setShowRegisterModal(false);
        
        // Preencher dados do cliente com dados do registro
        setCustomerData(prev => ({
          ...prev,
          name: registerData.tutorName,
          email: registerData.email
        }));
        
        setRegisterData({
          tutorName: '',
          email: '',
          password: '',
          petName: '',
          petType: '',
          petAge: '',
          petSize: ''
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      alert('Erro ao criar conta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    try {
      setIsLoggedIn(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const selectPlan = (plan) => {
    try {
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
      alert('Erro ao selecionar plano. Tente novamente.');
    }
  };

  // Painel Admin Simplificado
  if (isAdmin) {
    return (
      <div className="bg-gray-900 text-white p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-orange-400">Painel Administrativo PetBox</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sair
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Total de Clientes</h3>
              <p className="text-3xl font-bold text-orange-400">0</p>
              <p className="text-sm text-gray-400">Aguardando dados reais</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Assinaturas Ativas</h3>
              <p className="text-3xl font-bold text-orange-400">0</p>
              <p className="text-sm text-gray-400">Aguardando dados reais</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Receita Mensal</h3>
              <p className="text-3xl font-bold text-orange-400">R$ 0,00</p>
              <p className="text-sm text-gray-400">Aguardando dados reais</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Conversão</h3>
              <p className="text-3xl font-bold text-orange-400">0%</p>
              <p className="text-sm text-gray-400">Aguardando dados reais</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Configurações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Gerenciar Planos
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Configurar Pagamentos
                </button>
                <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                  Personalizar Site
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                  Exportar Relatório
                </button>
                <button className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                  Backup dos Dados
                </button>
                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  Ver Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Banner promocional */}
      <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm">
        Primeira box com 30% de desconto! Use o código: PRIMEIRA30
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">PetBox</span>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-900 hover:text-orange-500 transition-colors">Como Funciona</a>
              <a href="#" className="text-gray-900 hover:text-orange-500 transition-colors">Planos</a>
              <a href="#" className="text-gray-900 hover:text-orange-500 transition-colors">Blog</a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 text-gray-900 hover:text-orange-500 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Minha Área</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-900 hover:text-orange-500 transition-colors"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Cadastrar
                  </button>
                </>
              )}
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              <a href="#" className="block py-2 text-gray-900 hover:text-orange-500">Como Funciona</a>
              <a href="#" className="block py-2 text-gray-900 hover:text-orange-500">Planos</a>
              <a href="#" className="block py-2 text-gray-900 hover:text-orange-500">Blog</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Transforme momentos comuns em memórias extraordinárias
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Caixas mensais personalizadas com roupas, brinquedos e acessórios únicos para criar experiências inesquecíveis com seu pet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => !isLoggedIn ? setShowRegisterModal(true) : selectPlan(plans[1])}
                className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Começar Agora
              </button>
              <button className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors">
                Descobrir Plano Ideal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona a magia?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Três passos simples para transformar a rotina do seu pet em momentos especiais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Conte sobre seu pet</h3>
              <p className="text-gray-600">Compartilhe as preferências, tamanho e personalidade do seu companheiro</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Receba sua box personalizada</h3>
              <p className="text-gray-600">Todo mês, produtos únicos escolhidos especialmente para seu pet</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Criem memórias juntos</h3>
              <p className="text-gray-600">Momentos especiais com roupas, brinquedos e acessórios exclusivos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano perfeito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada plano foi pensado para diferentes estilos e necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-white p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-orange-500 shadow-xl relative' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-orange-500 mb-2">{plan.price}</div>
                  <div className="text-gray-500">por mês</div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => selectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Escolher {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                pet: "Luna (Golden Retriever)",
                text: "A Luna fica super animada quando a box chega! Os produtos são de ótima qualidade e sempre tem algo novo para descobrirmos juntas.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
              },
              {
                name: "João Santos",
                pet: "Thor (Bulldog Francês)",
                text: "Melhor investimento que fiz para o Thor! Ele adora as roupinhas e os brinquedos são super resistentes. Recomendo muito!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
              },
              {
                name: "Ana Costa",
                pet: "Mimi (Gato Persa)",
                text: "Mesmo sendo para gatos, a variedade é incrível! A Mimi se diverte muito e eu fico feliz vendo ela tão animada com os novos brinquedos.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">Tutor do {testimonial.pet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de tutores que já transformaram a rotina dos seus pets em momentos especiais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => !isLoggedIn ? setShowRegisterModal(true) : selectPlan(plans[1])}
              className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Começar Minha Jornada
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors">
              Fazer Quiz Personalizado
            </button>
          </div>
          <p className="text-sm text-white/70 mt-4">
            Primeira box com 30% de desconto • Sem fidelidade • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-bold">PetBox</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando momentos comuns em memórias extraordinárias com seu pet.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; 2024 PetBox. Todos os direitos reservados.
            </p>
            
            {/* Botão Admin no final da página */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs text-gray-500 hover:text-orange-500 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Entrar</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Senha</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Entrar
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Não tem conta?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                  className="text-orange-500 hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
              
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
                <strong>Demo:</strong> Use admin@petbox.com / admin123 para acessar o painel admin
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Cadastrar</h2>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Seus dados</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nome completo</label>
                      <input
                        type="text"
                        value={registerData.tutorName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, tutorName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Senha</label>
                      <input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Dados do seu pet</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nome do pet</label>
                      <input
                        type="text"
                        value={registerData.petName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, petName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Tipo</label>
                      <select
                        value={registerData.petType}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, petType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Idade</label>
                      <select
                        value={registerData.petAge}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, petAge: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Filhote (0-1 ano)">Filhote (0-1 ano)</option>
                        <option value="Jovem (1-3 anos)">Jovem (1-3 anos)</option>
                        <option value="Adulto (3-7 anos)">Adulto (3-7 anos)</option>
                        <option value="Idoso (7+ anos)">Idoso (7+ anos)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Porte</label>
                      <select
                        value={registerData.petSize}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, petSize: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Pequeno">Pequeno (até 10kg)</option>
                        <option value="Médio">Médio (10-25kg)</option>
                        <option value="Grande">Grande (25kg+)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Criar Conta
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Já tem conta?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-orange-500 hover:underline"
                >
                  Faça login
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Finalizar Pagamento</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Resumo do Plano */}
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">{selectedPlan.price}</div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                </div>
              </div>

              {/* Seleção do Método de Pagamento */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Método de Pagamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                      paymentMethod === 'credit_card' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Cartão de Crédito</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                      paymentMethod === 'pix' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">PIX</span>
                  </button>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">CPF *</label>
                    <input
                      type="text"
                      value={customerData.document}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, document: e.target.value }))}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">CEP</label>
                    <input
                      type="text"
                      value={customerData.zipCode}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Rua</label>
                    <input
                      type="text"
                      value={customerData.street}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Número</label>
                    <input
                      type="text"
                      value={customerData.streetNumber}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, streetNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={customerData.neighborhood}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={customerData.city}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Estado</label>
                    <select
                      value={customerData.state}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="BA">Bahia</option>
                      <option value="GO">Goiás</option>
                      <option value="PE">Pernambuco</option>
                      <option value="CE">Ceará</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados do Cartão (apenas se cartão selecionado) */}
              {paymentMethod === 'credit_card' && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Dados do Cartão
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Número do Cartão *</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nome no Cartão *</label>
                      <input
                        type="text"
                        value={cardData.holderName}
                        onChange={(e) => setCardData(prev => ({ ...prev, holderName: e.target.value.toUpperCase() }))}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Mês *</label>
                      <select
                        value={cardData.expirationMonth}
                        onChange={(e) => setCardData(prev => ({ ...prev, expirationMonth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Mês</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Ano *</label>
                      <select
                        value={cardData.expirationYear}
                        onChange={(e) => setCardData(prev => ({ ...prev, expirationYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Ano</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">CVV *</label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={isProcessingPayment}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => paymentMethod === 'credit_card' ? processCardPayment(selectedPlan) : processPixPayment(selectedPlan)}
                  disabled={isProcessingPayment}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'credit_card' ? (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pagar {selectedPlan.price}
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4" />
                          Pagar com PIX
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>

              {/* Informações de Segurança */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Pagamento 100% seguro</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Seus dados são protegidos com criptografia SSL e processados pelo FuriaPay
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}