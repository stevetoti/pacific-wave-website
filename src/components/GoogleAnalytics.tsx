"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-65F5VLD82W";
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const training = pathname === "/vanuatu-training";
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    const update = () => {
      const allowed =
        sessionStorage.getItem("pwd-training-analytics") === "granted";
      setConsent(allowed);
      const w = window as unknown as Record<string, unknown>;
      w[`ga-disable-${GA_MEASUREMENT_ID}`] = training && !allowed;
    };
    update();
    window.addEventListener("training-analytics-consent", update);
    return () =>
      window.removeEventListener("training-analytics-consent", update);
  }, [training]);
  if (!GA_MEASUREMENT_ID || (training && !consent)) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script>
      {training && consent && (
        <Script
          id="training-analytics-view"
          strategy="afterInteractive"
        >{`gtag('event','training_form_view',{cohort_id:'vanuatu-2026-10'});`}</Script>
      )}
    </>
  );
}
