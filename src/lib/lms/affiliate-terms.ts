// Public policy shared by the website, affiliate dashboard and welcome email.
// Payout review and transfers remain manual; this text does not initiate payments.
export const affiliateTermsUpdated = "30 October 2026";
export const affiliateTermsUrl = "/affiliates#affiliate-terms";
export const affiliatePayoutSummary =
  "Payouts are processed once each month through Global Digital Prime Inc., our USA company, when your approved unpaid balance reaches US$50 or its equivalent. Lower balances carry forward. We pay in USD or a suitable local currency agreed with you, converting before transfer where needed. We cover transfer and currency-conversion fees; these are not deducted from your commission. Payout details must be verified before payment.";

export const affiliateTerms = [
  {
    title: "Joining and earning commission",
    body: "The programme is open to affiliates worldwide, including Papua New Guinea. Joining is free. Use your personal referral link to promote eligible Pacific Wave Digital courses. The standard commission is 15% of the amount actually paid by an eligible referred student, after discounts. Self-referrals do not earn commission. Refunded or revoked enrolments do not qualify for unpaid commission. Approval to promote courses is separate from verification for payouts.",
  },
  {
    title: "Who pays you",
    body: "Affiliate payouts are made through Global Digital Prime Inc., our USA company, on behalf of the Pacific Wave Digital affiliate programme.",
  },
  {
    title: "Commission and payout currencies",
    body: "Commission is calculated and recorded in the currency of the student's course payment. You may receive your payout in USD or a suitable local currency agreed with you. Where conversion is needed, the money is converted before it is sent to you. The exchange rate quoted by the payment provider when the payout is arranged determines the converted amount; we confirm the payout currency, conversion rate and amount with you before transfer.",
  },
  {
    title: "US$50 minimum balance",
    body: "Your approved unpaid commission balance must reach US$50, or its equivalent in your payout currency, to qualify for a payout. We use the payment provider's quoted exchange rate when reviewing the monthly payout to check the equivalent value. Balances below the minimum carry forward to a later monthly cycle until the threshold is reached.",
  },
  {
    title: "Monthly payout schedule",
    body: "Payouts are processed once each month after commission review, provided the minimum balance is reached and your payout details have been verified. A commission first appears as pending after the student's payment is confirmed; it becomes eligible for payout after approval. Bank or payment-provider processing time may affect when the money reaches your account.",
  },
  {
    title: "Your full commission",
    body: "We transfer your full approved commission, converted to the agreed payout currency where needed. We cover transfer and currency-conversion fees; these fees are not deducted from your commission.",
  },
  {
    title: "Verification before your first payout",
    body: "Provide your full legal name, verified account email, phone number, country, preferred payout currency and accurate receiving-account details. For a bank payout, include the bank name, account-holder name, account number or IBAN, and SWIFT/BIC or routing details where required. A mobile-money payout requires the provider, registered account name and receiving number. The receiving account must be in your name or your registered business's name. We review these details before the first payout and when they change. A recipient address, proof of account ownership, government-issued ID or business-registration document may be requested only when needed to resolve a mismatch or meet the payment provider's verification requirements. We explain what is needed and arrange a secure submission method before requesting sensitive documents. Do not put identity documents in payout notes or send them by ordinary email. We never need your banking password, PIN, card security code or one-time login code.",
  },
  {
    title: "Promotion and privacy",
    body: "Promote honestly, avoid spam and do not promise income, jobs or guaranteed results. Verification and payout information is used to administer your affiliate account, check receiving details and make payments through Global Digital Prime Inc. and the payment providers involved. Access is limited to authorised staff and providers who need it for these purposes. See our Privacy Policy for information about your data and how to request access or correction. Questions about these terms or a payout can be sent to steve@pacificwavedigital.com.",
  },
] as const;
