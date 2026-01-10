'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface PixelConfig {
  facebookPixelId: string;
  googleAnalyticsId: string;
  googleAdsId: string;
  tiktokPixelId: string;
  metaConversionApi: string;
}

export default function PixelTracking() {
  const [pixelConfig, setPixelConfig] = useState<PixelConfig | null>(null);

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedConfig = localStorage.getItem('petbox_pixel_config');
    if (savedConfig) {
      try {
        setPixelConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configurações de pixel:', error);
      }
    }
  }, []);

  if (!pixelConfig) return null;

  return (
    <>
      {/* Facebook Pixel */}
      {pixelConfig.facebookPixelId && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelConfig.facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${pixelConfig.facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {pixelConfig.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${pixelConfig.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${pixelConfig.googleAnalyticsId}');
              `,
            }}
          />
        </>
      )}

      {/* Google Ads */}
      {pixelConfig.googleAdsId && (
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', '${pixelConfig.googleAdsId}');
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {pixelConfig.tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},
                ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
                var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${pixelConfig.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}

// Funções auxiliares para rastreamento de eventos
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, eventData);
  }
};

export const trackPurchase = (value: number, currency: string = 'BRL', transactionId?: string) => {
  trackEvent('Purchase', {
    value,
    currency,
    transaction_id: transactionId,
  });
};

export const trackAddToCart = (contentName: string, value: number, currency: string = 'BRL') => {
  trackEvent('AddToCart', {
    content_name: contentName,
    value,
    currency,
  });
};

export const trackInitiateCheckout = (value: number, currency: string = 'BRL') => {
  trackEvent('InitiateCheckout', {
    value,
    currency,
  });
};

export const trackCompleteRegistration = (method: string = 'email') => {
  trackEvent('CompleteRegistration', {
    method,
  });
};

// Declarações globais
declare global {
  interface Window {
    fbq?: (action: string, eventName: string, data?: Record<string, any>) => void;
    gtag?: (command: string, ...args: any[]) => void;
    ttq?: {
      track: (eventName: string, data?: Record<string, any>) => void;
      page: () => void;
    };
  }
}
