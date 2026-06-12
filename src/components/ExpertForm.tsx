"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";

/**
 * Talk-to-an-expert form — non-submitting, UI only. Calm, customer-led intake
 * (no urgency/scarcity copy). On submit it shows an on-brand confirmation.
 */
export function ExpertForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="stack-md" style={{ padding: "32px 0" }}>
        <h2 className="h3">
          Thanks. We&rsquo;ll be in touch <em>within a day.</em>
        </h2>
        <p className="body">
          One of our team will read what you&rsquo;ve written and call you back within 24 hours. If
          something changes before then, send a second message — we&rsquo;ll read both.
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
        <label htmlFor="phone">What&rsquo;s the best number to reach you on?</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="field">
        <label htmlFor="email">And an email, in case we can&rsquo;t reach you by phone.</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>

      <fieldset className="field-group">
        <legend>What are you trying to do?</legend>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="intent" defaultChecked />
            <span>I&rsquo;m buying my first investment property.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="intent" />
            <span>I&rsquo;m buying my next investment property.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="intent" />
            <span>I&rsquo;m refinancing an existing loan.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="intent" />
            <span>I&rsquo;m reviewing my current portfolio.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="intent" />
            <span>Something else — I&rsquo;ll explain below.</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>When would you like to hear from us?</legend>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="timing" defaultChecked />
            <span>Whenever suits — I&rsquo;m just exploring.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="timing" />
            <span>Sometime in the next few months.</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="timing" />
            <span>I&rsquo;m working through a decision now.</span>
          </label>
        </div>
      </fieldset>

      <div>
        <button type="submit" className="btn btn-primary">
          Send my details <Arrow />
        </button>
        <p className="body-small" style={{ marginTop: 14 }}>
          We&rsquo;ll call you back within a day. If you&rsquo;d rather email,{" "}
          <a className="inline-link" href="mailto:hello@helpmeinvest.com.au">
            hello@helpmeinvest.com.au
          </a>{" "}
          reaches the same person.
        </p>
      </div>
    </form>
  );
}
