"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  CreditCard,
  FileUp,
  Landmark,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Tag,
  Upload,
} from "lucide-react";
import { money, paymentReference, type Bank, type Order } from "@/lib/lms/types";
import { BankBadge, MastercardMark, VisaMark } from "./PaymentBrands";
// Step-by-step payment page for first-time payers: Option 1 bank transfer, Option 2 card.
export default function PaymentOptions({
  order,
  courseTitle,
  banks,
  cardEnabled,
  busy,
  onCoupon,
  onCard,
  onProof,
}: {
  order: Order;
  courseTitle: string;
  banks: Bank[];
  cardEnabled: boolean;
  busy: boolean;
  onCoupon: (code: string) => void;
  onCard: () => void;
  onProof: (bank: string, file: File) => void;
}) {
  const [copied, setCopied] = useState("");
  const [bank, setBank] = useState("");
  const [fileName, setFileName] = useState("");
  const amount = money(order.amount, order.currency);
  const reference = paymentReference(order.id);
  const accounts = banks.filter((b) => b.currency === order.currency);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* Copy is a convenience only. */
    }
  }
  const copyButton = (text: string, label: string) => (
    <button type="button" className="pay-copy" onClick={() => copy(text)} aria-label={`Copy ${label}`}>
      {copied === text ? <Check size={15} /> : <Copy size={15} />}
      {copied === text ? "Copied" : "Copy"}
    </button>
  );
  return (
    <div className="pay">
      <div className="pay-summary">
        <span>Amount to pay</span>
        <strong>{amount}</strong>
        <small>{courseTitle}</small>
        {order.coupon_code && (
          <small className="pay-coupon-applied">
            <Tag size={13} /> Coupon {order.coupon_code} applied · you saved {money(order.discount_amount || 0, order.currency)}
          </small>
        )}
        <div className="pay-ref">
          <span>
            Your payment reference
            <strong>{reference}</strong>
          </span>
          {copyButton(reference, "payment reference")}
        </div>
      </div>
      {order.review_note && <p className="lms-alert">{order.review_note}</p>}
      <p className="pay-intro">
        Choose <strong>one</strong> of the two ways to pay below. Not sure which
        to choose? <strong>Option 1</strong> works with any bank account in
        Vanuatu, at the bank counter or in your mobile banking app.
      </p>

      <section className="pay-option" aria-labelledby="pay-bank-title">
        <header>
          <span className="pay-option-number">Option 1</span>
          <h3 id="pay-bank-title">
            <Landmark size={22} /> Pay by bank transfer
          </h3>
          <div className="pay-brands">
            {accounts.map((b) => (
              <BankBadge key={b.bank} bank={b.bank} />
            ))}
          </div>
        </header>
        {accounts.length ? (
          <ol className="pay-steps">
            <li>
              <span className="pay-step-icon"><Landmark size={18} /></span>
              <div>
                <strong>Send {amount} to one of our bank accounts</strong>
                <p>Go to the bank, or use your mobile or internet banking. Either account is fine.</p>
                <div className="pay-accounts">
                  {accounts.map((b) => (
                    <div className="pay-account" key={b.bank}>
                      <BankBadge bank={b.bank} large />
                      <dl>
                        <div><dt>Account name</dt><dd>{b.account_name}</dd></div>
                        <div>
                          <dt>Account number</dt>
                          <dd className="pay-account-number">
                            {b.account_number}
                            {copyButton(b.account_number, `${b.bank} account number`)}
                          </dd>
                        </div>
                        <div><dt>Branch</dt><dd>{b.branch}</dd></div>
                        {b.swift_code && <div><dt>SWIFT (overseas only)</dt><dd>{b.swift_code}</dd></div>}
                        <div><dt>Currency</dt><dd>{b.currency}</dd></div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            </li>
            <li>
              <span className="pay-step-icon"><Smartphone size={18} /></span>
              <div>
                <strong>Write your reference <span className="pay-ref-inline">{reference}</span></strong>
                <p>Type it in the &ldquo;reference&rdquo; or &ldquo;description&rdquo; box, or give it to the bank teller. It tells us the payment is yours.</p>
              </div>
            </li>
            <li>
              <span className="pay-step-icon"><ReceiptText size={18} /></span>
              <div>
                <strong>Keep your receipt</strong>
                <p>Take a clear photo of the bank receipt, or a screenshot of the &ldquo;transfer successful&rdquo; screen in your banking app.</p>
              </div>
            </li>
            <li>
              <span className="pay-step-icon"><Upload size={18} /></span>
              <div>
                <strong>Upload your receipt here</strong>
                <form
                  className="pay-upload"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const file = new FormData(e.currentTarget).get("proof") as File;
                    if (bank && file?.size) onProof(bank, file);
                  }}
                >
                  <fieldset disabled={busy}>
                    <p className="pay-label">Which bank did you pay into?</p>
                    <div className="pay-bank-choice" role="radiogroup" aria-label="Bank you paid into">
                      {accounts.map((b) => (
                        <label key={b.bank} className={bank === b.bank ? "selected" : ""}>
                          <input type="radio" name="bank" value={b.bank} required checked={bank === b.bank} onChange={() => setBank(b.bank)} />
                          <BankBadge bank={b.bank} />
                        </label>
                      ))}
                    </div>
                    <label className="pay-file">
                      <FileUp size={22} />
                      <span>{fileName || "Choose photo or PDF of your receipt"}</span>
                      <small>JPG, PNG or PDF · up to 3 MB</small>
                      <input
                        name="proof"
                        type="file"
                        required
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                      />
                    </label>
                    <button className="lms-button pay-submit">
                      <Upload size={18} /> Send my receipt
                    </button>
                    <p className="lms-muted">
                      Your receipt is private. We check it within 1 working day,
                      then your lessons unlock and we email you.
                    </p>
                  </fieldset>
                </form>
              </div>
            </li>
          </ol>
        ) : (
          <p className="pay-unavailable">
            Bank details are being updated. Please message us on WhatsApp and we&apos;ll send them to you.
          </p>
        )}
      </section>

      <section className="pay-option" aria-labelledby="pay-card-title">
        <header>
          <span className="pay-option-number">Option 2</span>
          <h3 id="pay-card-title">
            <CreditCard size={22} /> Pay by card
          </h3>
          <div className="pay-brands">
            <VisaMark />
            <MastercardMark />
          </div>
        </header>
        {cardEnabled ? (
          <>
            <ol className="pay-steps compact">
              <li>
                <span className="pay-step-icon"><CreditCard size={18} /></span>
                <div>
                  <strong>Tap the button below</strong>
                  <p>A secure payment page opens. Enter your card number, expiry date and the 3-digit security code on the back.</p>
                </div>
              </li>
              <li>
                <span className="pay-step-icon"><Smartphone size={18} /></span>
                <div>
                  <strong>Confirm with your bank if asked</strong>
                  <p>Some banks send a code by SMS or ask you to approve in their app.</p>
                </div>
              </li>
              <li>
                <span className="pay-step-icon"><Check size={18} /></span>
                <div>
                  <strong>You&apos;re enrolled straight away</strong>
                  <p>You come back here automatically and your course opens. No receipt upload needed.</p>
                </div>
              </li>
            </ol>
            <button type="button" className="lms-button lms-wide pay-card-button" disabled={busy} onClick={onCard}>
              <ShieldCheck size={18} /> Pay {amount} by card
            </button>
            <p className="lms-muted">
              Visa and Mastercard debit or credit cards. Payments are processed
              securely by Stripe for Global Digital Prime, Inc. on behalf of
              Pacific Wave Digital training. We never see your card number.
            </p>
          </>
        ) : (
          <p className="pay-unavailable">Card payments are being set up. Please use Option 1 for now.</p>
        )}
      </section>

      {!order.coupon_code && (
        <details className="pay-coupon">
          <summary>
            <Tag size={15} /> Have a coupon code?
          </summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCoupon(String(new FormData(e.currentTarget).get("coupon") || ""));
            }}
          >
            <input name="coupon" required maxLength={40} placeholder="Enter your code" aria-label="Coupon code" />
            <button className="lms-button" disabled={busy}>Apply</button>
          </form>
        </details>
      )}
      <a className="pay-help" href="https://wa.me/6785288141" target="_blank" rel="noreferrer">
        <MessageCircle size={18} /> Need help paying? Message us on WhatsApp
      </a>
    </div>
  );
}
