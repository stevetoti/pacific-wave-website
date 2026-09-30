import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBotSignals, looksLikeGeneratedName, MIN_FILL_MS } from '../src/lib/security/bot-signals';
import { messageLooksReal } from '../src/lib/security/form-guard';

test('honeypot and sub-3s submits are refused; normal humans pass', () => {
  assert.equal(checkBotSignals({ honeypot: 'http://spam', formStartedAt: 0 }).ok, false);
  const now = 1_700_000_000_000;
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: now - 800, now }).ok, false);
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: now - MIN_FILL_MS - 1, now }).ok, true);
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: null, now }).ok, true);
});

test('the 29 Sep spam name is flagged, real names are not', () => {
  assert.equal(looksLikeGeneratedName('IAZbdEISQtLfatghMgdRBA'), true);
  assert.equal(looksLikeGeneratedName('iifQfOBmSAtHZBibzgBQ'), true);
  assert.equal(looksLikeGeneratedName('Stephen Totimeh'), false);
  assert.equal(looksLikeGeneratedName('Oluwaseunfunmi'), false);
});

test('digit-only and link-only messages are not real enquiries', () => {
  assert.equal(messageLooksReal('3283763479'), false);
  assert.equal(messageLooksReal('2990030907'), false);
  assert.equal(messageLooksReal('https://spam.example/buy'), false);
  assert.equal(messageLooksReal('We need a booking website for our resort in Santo.'), true);
  assert.equal(messageLooksReal(''), true);
});
