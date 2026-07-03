import { useState } from 'react';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser } from '../services/auth.js';

const CONTACT_INFO = [
  {
    icon: '📞',
    label: 'Phone',
    value: '+20 100 123 4567',
    href: 'tel:+201001234567',
    actionLabel: 'Call now',
  },
  {
    icon: '💬',
    label: 'WhatsApp',
    value: '+20 100 123 4567',
    href: 'https://wa.me/201001234567',
    actionLabel: 'Chat on WhatsApp',
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'support@hotel.com',
    href: 'mailto:support@hotel.com',
    actionLabel: 'Send an email',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How can I book a room?',
    answer:
      'You can book a room directly from our website by selecting your dates, choosing a room type, and confirming your reservation. You will receive a confirmation once the booking is complete.',
  },
  {
    question: 'Can I cancel or modify my booking?',
    answer:
      'Yes, you can cancel or modify an upcoming booking from your account as long as it has not been checked into yet. If you need help, our support team is available through this page.',
  },
  {
    question: 'How do I request a hotel service during my stay?',
    answer:
      'Once you have an active booking, you can request any of our hotel services from the Services page. Your request is sent directly to our staff for handling.',
  },
  {
    question: 'What are the check-in and check-out times?',
    answer:
      'Check-in starts at 2:00 PM and check-out is until 12:00 PM. Early check-in or late check-out may be available on request, subject to availability.',
  },
  {
    question: 'How can I get an invoice for my stay?',
    answer:
      'An invoice is generated automatically once your booking is confirmed and updated as you add services. You can view and download it from your profile at any time.',
  },
  {
    question: 'Who do I contact for an urgent issue?',
    answer:
      'For anything urgent, calling us directly or reaching out on WhatsApp is the fastest way to get help. Our team is available around the clock.',
  },
];

const TICKET_CATEGORIES = ['Booking', 'Payment & Invoices', 'Room & Services', 'Account', 'Other'];

function MessageBox({ type, message, onClose }) {
  const colors = {
    success: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: '✅' },
    error: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <span style={{ fontSize: 14, color: c.text, fontWeight: 500, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: c.text, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ContactCard({ item }) {
  return (
    <a
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)',
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        textDecoration: 'none',
        flex: 1,
        minWidth: 220,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#f0f9ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {item.icon}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {item.label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0ea5e9' }}>{item.actionLabel} →</span>
    </a>
  );
}

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{item.question}</span>
              <span style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isOpen ? '#0ea5e9' : '#f1f5f9',
                color: isOpen ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                transition: 'background 0.15s, color 0.15s',
              }}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 22px 20px' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SupportTicketForm() {
  const user = getCurrentUser();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: TICKET_CATEGORIES[0],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setStatus(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: 'warning', text: 'Please fill in your name, email, and message before submitting.' });
      return;
    }

    setSubmitting(true);
    try {
      await dashboardApi.createSupportTicket({
        name: form.name,
        email: form.email,
        category: form.category,
        message: form.message,
      });
      setStatus({ type: 'success', text: 'Your message has been sent. Our team will get back to you shortly.' });
      setForm((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setStatus({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    display: 'block',
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} value={form.name} onChange={handleChange('name')} placeholder="Your name" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={form.email} onChange={handleChange('email')} placeholder="you@example.com" type="email" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={form.category} onChange={handleChange('category')}>
            {TICKET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Message</label>
          <textarea
            style={{ ...inputStyle, minHeight: 130, resize: 'vertical', fontFamily: 'inherit' }}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Tell us how we can help..."
          />
        </div>
      </div>

      {status && (
        <MessageBox type={status.type} message={status.text} onClose={() => setStatus(null)} />
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          alignSelf: 'flex-start',
          padding: '12px 28px',
          borderRadius: 12,
          border: 'none',
          background: submitting ? '#7dd3fc' : '#0ea5e9',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = '#0284c7'; }}
        onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = '#0ea5e9'; }}
      >
        {submitting ? 'Sending...' : 'Send message'}
      </button>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '52px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Support</div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Help Center</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 auto', maxWidth: 480 }}>We are here to help. Find quick answers or reach out to our team directly.</p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 56 }}>
        <section>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {CONTACT_INFO.map((item) => (
              <ContactCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Frequently Asked Questions</h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </section>

        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Still need help?</h2>
          <SupportTicketForm />
        </section>
      </div>
    </div>
  );
}