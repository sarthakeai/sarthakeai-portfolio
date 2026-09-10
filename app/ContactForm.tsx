"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { contactFormEndpoint, submitContactForm } from "./contact-form-submit.mjs";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const sending = status === "sending";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    submittingRef.current = true;
    setStatus("sending");

    try {
      await submitContactForm(new FormData(form));
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.key !== "Enter" || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    if (submittingRef.current) return;
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form ref={formRef} className="contact-form" action={contactFormEndpoint} method="POST" onSubmit={handleSubmit} aria-busy={sending}>
      <div className="contact-form-row">
        <label>
          <input type="text" name="name" autoComplete="name" aria-label="Your Name" placeholder="Your Name" required disabled={sending} />
        </label>
        <label>
          <input type="email" name="email" autoComplete="email" aria-label="Your Email" placeholder="Your Email" required disabled={sending} />
        </label>
      </div>

      <label className="contact-form-message">
        <textarea name="message" aria-label="Your Message" placeholder="Your Message" rows={7} required disabled={sending} onKeyDown={handleKeyDown} />
      </label>

      <label className="contact-honeypot" aria-hidden="true">
        <span>Leave this field empty</span>
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="contact-form-actions">
        <button className="contact-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
        <p className="contact-form-hint"><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to send</p>
      </div>

      <div className="contact-form-status" aria-live="polite" aria-atomic="true">
        {status === "sending" ? <p>Sending…</p> : null}
        {status === "success" ? <p className="is-success">Message sent. I’ll get back to you soon. <span aria-hidden="true">✓</span></p> : null}
        {status === "error" ? (
          <p className="is-error">Something went wrong. Please try again or email me directly. <a href="mailto:officialsarthakeai@gmail.com">officialsarthakeai@gmail.com</a></p>
        ) : null}
      </div>
    </form>
  );
}
