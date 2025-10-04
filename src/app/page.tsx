"use client";

import { useState } from 'react';
import { Check, Star, Heart, Gift, Truck, Shield, ChevronRight, Menu, X } from 'lucide-react';

export default function PetBoxHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 'R$ 49,90',
      originalPrice: 'R$ 69,90',
      description: 'Perfeito para começar a mimar seu pet',
      items: [
        '3-4 produtos selecionados',
        '1 brinquedo premium',
        '2 petiscos naturais',
        'Ração premium (amostra)',
        'Frete grátis'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 79,90',
      originalPrice: 'R$ 99,90',
      description: 'O favorito dos tutores exigentes',
      items: [
        '5-6 produtos selecionados',
        '2 brinquedos premium',
        '3 petiscos gourmet',
        'Ração premium (porção completa)',
        '1 acessório exclusivo',
        'Frete grátis',
        'Personalização avançada'
      ],
      popular: true
    },
    {
      id: 'super',
      name: 'Super Premium',
      price: 'R$ 129,90',
      originalPrice: 'R$ 159,90',
      description: 'A experiência mais completa para seu pet',
      items: [
        '7-8 produtos selecionados',
        '3 brinquedos premium',
        '4 petiscos gourmet',
        'Ração super premium',
        '2 acessórios exclusivos',
        'Produto de higiene premium',
        'Frete grátis',
        'Personalização total',
        'Suporte prioritário'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Marina Silva',
      pet: 'Luna (Golden Retriever)',
      text: 'A Luna fica louca quando chega a caixinha! Os produtos são de altíssima qualidade e sempre tem novidades.',
      rating: 5
    },
    {
      name: 'Carlos Mendes',
      pet: 'Mimi (Persa)',
      text: 'Minha gata nunca foi tão feliz. Os petiscos são naturais e os brinquedos são resistentes. Recomendo!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      pet: 'Thor (Labrador)',
      text: 'Praticidade total! Não preciso mais me preocupar em escolher produtos. Tudo chega certinho em casa.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PetBox
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-gray-700 hover:text-orange-600 transition-colors">
                Como funciona
              </a>
              <a href="#planos" className="text-gray-700 hover:text-orange-600 transition-colors">
                Planos
              </a>
              <a href="#depoimentos" className="text-gray-700 hover:text-orange-600 transition-colors">
                Depoimentos
              </a>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                Assinar agora
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-orange-100">
              <div className="flex flex-col space-y-4">
                <a href="#como-funciona" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Como funciona
                </a>
                <a href="#planos" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Planos
                </a>
                <a href="#depoimentos" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Depoimentos
                </a>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 w-full">
                  Assinar agora
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                O clube de assinatura que seu{' '}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  pet merece
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Produtos premium selecionados especialmente para o seu melhor amigo. 
                Ração, petiscos, brinquedos e acessórios entregues na sua porta todo mês.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Começar agora
                </button>
                <button className="border-2 border-orange-300 text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-all duration-300">
                  Ver como funciona
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  <span>Frete grátis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sua PetBox chegou!</h3>
                    <p className="text-gray-600 mb-4">5 produtos selecionados para Luna</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Ração Premium Royal Canin</span>
                        <span>✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brinquedo Kong Classic</span>
                        <span>✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Petisco Natural DogShow</span>
                        <span>✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como funciona o PetBox
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um processo simples e personalizado para garantir que seu pet receba exatamente o que precisa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Conte sobre seu pet</h3>
              <p className="text-gray-600">
                Responda algumas perguntas sobre seu pet: porte, idade, preferências e necessidades especiais.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nós selecionamos</h3>
              <p className="text-gray-600">
                Nossa equipe de especialistas seleciona produtos premium personalizados para seu pet.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Receba em casa</h3>
              <p className="text-gray-600">
                Todo mês você recebe uma caixa especial com produtos selecionados, com frete grátis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planos pensados para diferentes perfis e necessidades. Todos com produtos premium e frete grátis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-500 line-through">{plan.originalPrice}</div>
                      <div className="text-sm text-gray-600">/mês</div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.items.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
                      : 'border-2 border-orange-300 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  Escolher {plan.name}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Não tem certeza? Comece com 30 dias grátis em qualquer plano
            </p>
            <button className="text-orange-600 hover:text-orange-700 font-semibold flex items-center justify-center space-x-2 mx-auto">
              <span>Saiba mais sobre a garantia</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mais de 10.000 pets felizes e tutores satisfeitos em todo o Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">Tutora da {testimonial.pet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para fazer seu pet mais feliz?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Junte-se a milhares de tutores que já descobriram a praticidade do PetBox
          </p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Começar minha assinatura
          </button>
          <p className="text-orange-100 mt-4 text-sm">
            Primeira caixa grátis • Cancele quando quiser • Frete grátis para todo Brasil
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">PetBox</span>
              </div>
              <p className="text-gray-400">
                O clube de assinatura que seu pet merece. Produtos premium entregues na sua porta.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parceiros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PetBox. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}