'use client';

import { useState } from 'react';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';
import { HoneypotField, useFormBotFields } from '@/components/security/FormBotFields';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const bot = useFormBotFields();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus('error');
      setMessage('Please complete the human verification check.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, website: bot.honeypot, form_started_at: bot.formStartedAt ?? undefined, turnstile_token: turnstileToken ?? undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error('Subscription could not be saved');
      setStatus('success');
      setMessage('Thanks! Your subscription has been saved.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setTurnstileToken(null);
      setCaptchaAttempt((n) => n + 1);
    }
  };

  return (
    <div className="mt-12 p-8 bg-gradient-to-br from-deep-blue to-dark-navy rounded-2xl">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-white font-heading mb-4">
          Stay Ahead of the Curve
        </h3>
        <p className="text-blue-100 mb-6">
          Get updates on AI, digital transformation, and business growth strategies
          delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/20 text-green-100 px-6 py-4 rounded-lg">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-vibrant-orange text-gray-800"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-vibrant-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status !== 'success' && (
          <>
            <HoneypotField value={bot.honeypot} onChange={bot.setHoneypot} />
            {TURNSTILE_SITE_KEY && (
              <div className="mt-4 flex justify-center">
                <TurnstileWidget key={captchaAttempt} siteKey={TURNSTILE_SITE_KEY} onVerify={setTurnstileToken} theme="dark" />
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <p className="text-red-300 text-sm mt-3">{message}</p>
        )}

        <p className="text-blue-300 text-xs mt-4">
          By subscribing, you agree to receive email updates. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
