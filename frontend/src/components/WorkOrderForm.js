import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Cog,
  MessageCircleMore,
  RotateCcw,
  Tractor,
  Wrench,
} from "lucide-react";
import { LangContext } from "../LangContext";
import { sendContact } from "../lib/api";
import useCooldown from "../hooks/useCooldown";

const TOPICS = [
  { key: "purchase", Icon: Tractor },
  { key: "parts", Icon: Cog },
  { key: "service", Icon: Wrench },
  { key: "other", Icon: MessageCircleMore },
];

// Same rule the API enforces (ContactController).
const PHONE_PATTERN = /^[+\d][\d\s()-]{4,29}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = {
  topic: "purchase",
  name: "",
  phone: "",
  email: "",
  machine: "",
  message: "",
  website: "", // honeypot — hidden from people, bots fill it in
};

/** IT-YYMMDD-NNNN — printed on the ticket and quoted in the email. */
function newRef() {
  const d = new Date();
  const ymd = [d.getFullYear() % 100, d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, "0"))
    .join("");
  return `IT-${ymd}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

function validate(values, errors) {
  const out = {};
  if (!values.name.trim()) out.name = errors.required;
  if (!values.phone.trim()) out.phone = errors.required;
  else if (!PHONE_PATTERN.test(values.phone.trim())) out.phone = errors.phone;
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim()))
    out.email = errors.email;
  if (!values.message.trim()) out.message = errors.required;
  return out;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/**
 * "Next request in 0:42" with a ring that empties as the wait runs out.
 * The ring is a single CSS animation (linear — it's a clock), started
 * part-way through via a negative delay so a reload resumes it in place.
 */
function CooldownTimer({ remaining, total, until, template }) {
  const [delay] = useState(() => (until - Date.now()) / 1000 - total);
  const [before, after = ""] = template.split("{time}");

  return (
    <p className="wo-cooldown" role="timer">
      <svg className="wo-cooldown-ring" viewBox="0 0 20 20" width={18} height={18} aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <circle
          cx="10"
          cy="10"
          r="8"
          pathLength="100"
          style={{ animationDuration: `${total}s`, animationDelay: `${delay}s` }}
        />
      </svg>
      <span>
        {before}
        <strong>{formatTime(remaining)}</strong>
        {after}
      </span>
    </p>
  );
}

function Field({ id, label, error, wide, as: Tag = "input", ...inputProps }) {
  return (
    <div
      className={`wo-field ${wide ? "is-wide" : ""}`.trim()}
      data-invalid={error ? "true" : undefined}
    >
      <label className="wo-label" htmlFor={id}>
        {label}
      </label>
      <div className="wo-control">
        <Tag
          id={id}
          name={id}
          className="wo-input"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        <span className="wo-line" aria-hidden="true" />
      </div>
      {error && (
        <span className="wo-field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * The contact form, dressed as a machine work order: hazard-striped header,
 * numbered ticket, stamped "received" when it goes through. Submits to
 * POST /contact, which emails the office.
 */
export default function WorkOrderForm() {
  const { t, lang } = useContext(LangContext);
  const c = t.contactPage;

  const [ref, setRef] = useState(newRef);
  const [values, setValues] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [sendError, setSendError] = useState("");
  const formRef = useRef(null);
  const successRef = useRef(null);
  const cooldown = useCooldown("intertechnics:contact-cooldown");
  const coolingDown = cooldown.remaining > 0;

  const locked = status !== "idle";
  const date = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  const update = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (fieldErrors[name])
      setFieldErrors(({ [name]: _cleared, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (locked || coolingDown) return;

    const found = validate(values, c.errors);
    setFieldErrors(found);
    setSendError("");
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const { cooldown: wait } = await sendContact({ ...values, ref });
      cooldown.start(wait || 60);
      setStatus("sent");
    } catch (err) {
      if (err.status === 429 && err.retryAfter > 0) {
        // The server still has us on a timer (e.g. this browser forgot it).
        cooldown.start(err.retryAfter);
      } else {
        setSendError(err.status === 429 ? c.errors.rateLimited : c.errors.send);
      }
      setStatus("idle");
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setFieldErrors({});
    setRef(newRef());
    setStatus("idle");
  };

  const fieldProps = (id, extra = {}) => ({
    id,
    label: c.fields[id],
    value: values[id],
    onChange: update,
    error: fieldErrors[id],
    ...extra,
  });

  return (
    <form
      ref={formRef}
      className="work-order"
      data-state={status}
      data-cooling={coolingDown ? "true" : undefined}
      noValidate
      onSubmit={onSubmit}
    >
      <div className="wo-hazard" aria-hidden="true" />

      <header className="wo-head">
        <span className="wo-kicker">{c.ticket}</span>
        <dl className="wo-meta">
          <div>
            <dt>№</dt>
            <dd>{ref}</dd>
          </div>
          <div>
            <dt>{c.date}</dt>
            <dd>{date}</dd>
          </div>
        </dl>
      </header>

      <fieldset className="wo-step" disabled={locked} style={{ "--i": 0 }}>
        <legend className="wo-legend">
          <span className="wo-step-no">01</span>
          {c.steps.topic}
        </legend>
        <div className="wo-topics">
          {TOPICS.map(({ key, Icon }) => (
            <label className="wo-topic" key={key}>
              <input
                type="radio"
                name="topic"
                value={key}
                checked={values.topic === key}
                onChange={update}
              />
              <span className="wo-topic-face">
                <Icon className="wo-topic-icon" width={22} height={22} aria-hidden="true" />
                <span>{c.topics[key]}</span>
                <Check className="wo-topic-check" width={14} height={14} aria-hidden="true" />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="wo-step" disabled={locked} style={{ "--i": 1 }}>
        <legend className="wo-legend">
          <span className="wo-step-no">02</span>
          {c.steps.details}
        </legend>
        <div className="wo-grid">
          <Field {...fieldProps("name", { autoComplete: "name", maxLength: 100 })} />
          <Field
            {...fieldProps("phone", {
              type: "tel",
              inputMode: "tel",
              autoComplete: "tel",
              maxLength: 30,
            })}
          />
          <Field
            {...fieldProps("email", {
              type: "email",
              autoComplete: "email",
              maxLength: 254,
              wide: true,
            })}
          />
        </div>
      </fieldset>

      <fieldset className="wo-step" disabled={locked} style={{ "--i": 2 }}>
        <legend className="wo-legend">
          <span className="wo-step-no">03</span>
          {c.steps.job}
        </legend>
        <div className="wo-grid">
          <Field
            {...fieldProps("machine", {
              placeholder: c.placeholders.machine,
              maxLength: 120,
              wide: true,
            })}
          />
          <Field
            {...fieldProps("message", {
              as: "textarea",
              rows: 4,
              placeholder: c.placeholders.message,
              maxLength: 2000,
              wide: true,
            })}
          />
        </div>
      </fieldset>

      <div className="wo-hp" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={update}
          />
        </label>
      </div>

      <footer className="wo-foot" style={{ "--i": 3 }}>
        {status === "sent" ? (
          <div className="wo-success" ref={successRef} tabIndex={-1} role="status">
            <p className="wo-success-title">{c.successTitle}</p>
            <p className="wo-success-body">{c.successBody}</p>
            <div className="wo-success-actions">
              <button type="button" className="wo-again" onClick={reset}>
                <RotateCcw width={16} height={16} aria-hidden="true" />
                <span>{c.again}</span>
              </button>
              {coolingDown && (
                <CooldownTimer
                  key={cooldown.until}
                  remaining={cooldown.remaining}
                  total={cooldown.total}
                  until={cooldown.until}
                  template={c.cooldown}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="wo-error" role="alert">
              {sendError}
            </p>
            {coolingDown && (
              <CooldownTimer
                  key={cooldown.until}
                  remaining={cooldown.remaining}
                  total={cooldown.total}
                  until={cooldown.until}
                  template={c.cooldown}
                />
            )}
            <button
              type="submit"
              className="wo-submit"
              aria-disabled={status === "sending" || coolingDown ? "true" : undefined}
            >
              <span className="wo-submit-stripes" aria-hidden="true" />
              <span className="wo-submit-label" key={status}>
                {status === "sending" ? c.sending : c.submit}
              </span>
              <ArrowRight className="wo-submit-arrow" width={18} height={18} aria-hidden="true" />
            </button>
          </>
        )}
      </footer>

      {status === "sent" && (
        <div className="wo-stamp" aria-hidden="true">
          <span>{c.stamp}</span>
          <small>{ref}</small>
        </div>
      )}
    </form>
  );
}
