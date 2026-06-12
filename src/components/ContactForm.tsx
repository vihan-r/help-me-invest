"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";

/**
 * Contact form — non-submitting. On submit it shows an on-brand confirmation
 * (no backend wired). UI only.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="stack-md" style={{ padding: "32px 0" }}>
        <h2 className="h3">
          Your message is <em>on its way.</em>
        </h2>
        <p className="body">
          One of us will read it and reply within a day. If you&rsquo;d like to add anything else,
          send a second message — we&rsquo;ll read both.
        </p>
      </div>
    );
  }

  return (
    <form
      className="stack-lg"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="field">
        <label htmlFor="first-name">What&rsquo;s your first name?</label>
        <input id="first-name" name="first-name" type="text" autoComplete="given-name" />
      </div>

      <div className="field">
        <label htmlFor="email">What email should we use?</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>

      <fieldset className="field-group">
        <legend>What&rsquo;s this about?</legend>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="topic" defaultChecked />
            <span>I&rsquo;m new — where do I start?</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="topic" />
            <span>A question about a specific property or decision.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="topic" />
            <span>Partner enquiry.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="topic" />
            <span>Press / other.</span>
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="message">What&rsquo;s on your mind?</label>
        <textarea id="message" name="message" rows={6} />
      </div>

      <div>
        <button type="submit" className="btn btn-primary">
          Send <Arrow />
        </button>
      </div>
    </form>
  );
}
