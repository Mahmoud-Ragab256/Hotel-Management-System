import { useState } from 'react';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

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
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', icon: '✅' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5', icon: '❌' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', icon: '⚠️' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ fontSize: 13, color: c.text, fontWeight: 500, flex: 1, fontFamily: '"Inter", sans-serif' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: c.text, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ContactCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);
  const { colors } = useTheme();

  return (
    <a
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.bgCard,
        borderRadius: 20,
        border: isHovered ? `1px solid ${colors.borderHover}` : `1px solid ${colors.borderCard}`,
        boxShadow: isHovered ? colors.shadowHover : colors.shadow,
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        textDecoration: 'none',
        flex: 1,
        minWidth: 220,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: 'rgba(200, 90, 73, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        border: '1px solid rgba(200, 90, 73, 0.2)'
      }}>
        {item.icon}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"Inter", sans-serif' }}>
        {item.label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, fontFamily: '"Inter", sans-serif' }}>{item.value}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }}>
        {item.actionLabel} →
      </span>
    </a>
  );
}

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            style={{
              background: colors.bgCard,
              borderRadius: 16,
              border: isOpen ? `1px solid ${colors.borderHover}` : `1px solid ${colors.borderCard}`,
              overflow: 'hidden',
              transition: 'border-color 0.3s ease'
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
                outline: 'none'
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, fontFamily: '"Inter", sans-serif' }}>{item.question}</span>
              <span style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isOpen ? colors.accent : (colors.inputBg || '#222222'),
                color: isOpen ? '#ffffff' : colors.textPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                transition: 'background 0.2s, color 0.2s',
                border: isOpen ? 'none' : `1px solid ${colors.borderCard}`
              }}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 22px 20px', borderTop: `1px solid ${colors.borderCard}`, paddingTop: '16px' }}>
                <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary, lineHeight: 1.7, fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>{item.answer}</p>
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
  const { colors } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: TICKET_CATEGORIES[0],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

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
    border: `1px solid ${colors.inputBorder || 'rgba(255,255,255,0.1)'}`,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.inputBg,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Inter", sans-serif',
    transition: 'border-color 0.2s, background-color 0.2s',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
    display: 'block',
    fontFamily: '"Inter", sans-serif',
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.bgCard,
        borderRadius: 20,
        border: isHovered ? `1px solid ${colors.borderHover}` : `1px solid ${colors.borderCard}`,
        boxShadow: isHovered ? colors.shadowHover : colors.shadow,
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Full name</label>
            <input 
              style={inputStyle} 
              value={form.name} 
              onChange={handleChange('name')} 
              placeholder="Your name" 
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder || 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Email</label>
            <input 
              style={inputStyle} 
              value={form.email} 
              onChange={handleChange('email')} 
              placeholder="you@example.com" 
              type="email" 
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder || 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <div style={{ position: 'relative' }}>
            <select 
              style={{
                ...inputStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '14px',
                paddingRight: '40px'
              }} 
              value={form.category} 
              onChange={handleChange('category')}
            >
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: colors.bgCard, color: colors.textPrimary }}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Message</label>
          <textarea
            style={{ 
              ...inputStyle, 
              minHeight: 130, 
              resize: 'vertical', 
              fontFamily: 'inherit' 
            }}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Tell us how we can help..."
            onFocus={(e) => e.target.style.borderColor = colors.accent}
            onBlur={(e) => e.target.style.borderColor = colors.inputBorder || 'rgba(255,255,255,0.1)'}
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
          borderRadius: '24px',
          border: 'none',
          background: submitting ? (colors.bgCardAlt || '#2e2e2e') : colors.accent,
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s',
          fontFamily: '"Inter", sans-serif'
        }}
        onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = colors.accentHover; }}
        onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = colors.accent; }}
      >
        {submitting ? 'Sending...' : 'Send message'}
      </button>
    </div>
  );
}

export default function HelpCenterPage() {
  const { colors, isDark } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, fontFamily: '"Inter", sans-serif', paddingBottom: '120px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: colors.accent,
        border: `1px solid ${colors.borderCard}`,
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(200, 90, 73, 0.15)",
        padding: "60px 24px 48px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
          Support
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: '700', color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif' }}>
          Help Center
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.95)', margin: '0 auto', maxWidth: '480px', fontWeight: '300', lineHeight: '1.6' }}>
          We are here to help. Find quick answers or reach out to our team directly.
        </p>
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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, margin: '0 0 20px', fontFamily: '"Playfair Display", serif' }}>
            Frequently Asked Questions
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </section>

        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, margin: '0 0 20px', fontFamily: '"Playfair Display", serif' }}>
            Still need help?
          </h2>
          <SupportTicketForm />
        </section>
      </div>
    </div>
  );
}
