import Script from "next/script";

type PlatformTrackingScriptsProps = {
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  trackRegisterEvents?: boolean;
  trackDepositEvents?: boolean;
  trackWithdrawalEvents?: boolean;
};

export function PlatformTrackingScripts({
  googleAnalyticsId,
  googleTagManagerId,
  facebookPixelId,
  trackRegisterEvents = true,
  trackDepositEvents = true,
  trackWithdrawalEvents = true,
}: PlatformTrackingScriptsProps) {
  const trackingConfig = {
    googleAnalyticsId,
    googleTagManagerId,
    facebookPixelId,
    trackRegisterEvents,
    trackDepositEvents,
    trackWithdrawalEvents,
  };

  return (
    <>
      <Script id="platform-tracking-config" strategy="afterInteractive">
        {`window.__PLATFORM_TRACKING__ = ${JSON.stringify(trackingConfig)};`}
      </Script>

      {googleTagManagerId ? (
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
        </Script>
      ) : null}

      {googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
          </Script>
        </>
      ) : null}

      {facebookPixelId ? (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${facebookPixelId}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
    </>
  );
}

export function PlatformTrackingNoScript({
  googleTagManagerId,
  facebookPixelId,
}: Pick<
  PlatformTrackingScriptsProps,
  "googleTagManagerId" | "facebookPixelId"
>) {
  return (
    <>
      {googleTagManagerId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      ) : null}
      {facebookPixelId ? (
        <noscript>
          <img
            alt=""
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      ) : null}
    </>
  );
}
