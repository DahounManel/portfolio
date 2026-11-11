import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { usePortfolioData } from '../../context/PortfolioDataContext';

const empty = { name: '', email: '', message: '' };

export default function ContactForm() {
  const { data } = usePortfolioData();
  const profile = data.profile;
  const endpoint = `https://formsubmit.co/ajax/${profile.email}`;
  const [values, setValues] = useState(empty);
  const [status, setStatus] = useState('idle');

  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const fallbackHref = `mailto:${profile.email}?subject=${encodeURIComponent('Portfolio message')}&body=${encodeURIComponent(
    `From: ${values.name} (${values.email})\n\n${values.message}`
  )}`;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setStatus('invalid');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          _replyto: values.email.trim(),
          _subject: `Portfolio message from ${values.name.trim()}`,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || String(data.success) !== 'true') throw new Error('Request failed');
      setValues(empty);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-form contact-form-state" role="status">
        <CheckCircle2 size={27} />
        <h3>Message sent</h3>
        <p>Thanks for reaching out. I will reply to the email address you provided.</p>
        <button type="button" className="button button-secondary" onClick={() => setStatus('idle')}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-heading">
        <h3>Send a message</h3>
        <p>Write below and it will arrive in my inbox.</p>
      </div>
      <div className="contact-form-row">
        <label>
          <span>Name</span>
          <input type="text" name="name" value={values.name} onChange={update('name')} placeholder="Your name" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" value={values.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" required />
        </label>
      </div>
      <label>
        <span>Message</span>
        <textarea name="message" rows="5" value={values.message} onChange={update('message')} placeholder="Tell me about your project or opportunity" required />
      </label>
      <button className="button button-primary contact-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? <><Loader2 size={16} className="spin" /> Sending…</> : <>Send message <Send size={15} /></>}
      </button>
      {status === 'invalid' && <p className="contact-form-alert">Please add your name, email and message.</p>}
      {status === 'error' && (
        <p className="contact-form-alert">
          The message could not be sent. <a href={fallbackHref}>Email me directly <ArrowUpRight size={12} /></a>
        </p>
      )}
    </form>
  );
}
