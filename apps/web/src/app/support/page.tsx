'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Headphones, Loader2, Plus, Send, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const CATEGORIES = [
  { key: 'GENERAL', label: 'استفسار عام' },
  { key: 'BOOKING', label: 'مشكلة في حجز' },
  { key: 'PAYMENT', label: 'دفع واسترداد' },
  { key: 'TECHNICAL', label: 'مشكلة تقنية' },
  { key: 'COMPLAINT', label: 'شكوى' },
];

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة',
  IN_PROGRESS: 'قيد المعالجة',
  RESOLVED: 'محلولة',
  CLOSED: 'مغلقة',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-[var(--brand-soft)] text-[var(--brand-text)]',
  IN_PROGRESS: 'bg-[var(--warning-soft)] text-[var(--color-amber-ink)]',
  RESOLVED: 'bg-[var(--success-soft)] text-[var(--success)]',
  CLOSED: 'bg-[var(--bg-soft)] text-[var(--text-muted)]',
};

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  messages: { id: string; body: string; senderId: string; createdAt: string }[];
};

export default function SupportPage() {
  const { user, fetchMe } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const load = useCallback(async () => {
    if (!useAuth.getState().user && !useAuth.getState().loading) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<Ticket[]>('/support/tickets');
      setTickets(res ?? []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('اكتب الموضوع ونص الرسالة');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const ticket = await api.post<Ticket>('/support/tickets', {
        subject: subject.trim(),
        message: message.trim(),
        category,
      });
      setTickets((prev) => [ticket, ...prev]);
      setSubject('');
      setMessage('');
      setOpen(ticket.id);
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر إرسال التذكرة');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (ticketId: string) => {
    if (!reply.trim()) return;
    try {
      await api.post(`/support/tickets/${ticketId}/reply`, { body: reply.trim() });
      setReply('');
      await load();
      setOpen(ticketId);
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر إرسال الرد');
    }
  };

  if (!user) {
    return (
      <div className="container-bookly max-w-2xl py-8">
        <h1 className="section-title mb-6">الدعم والمساعدة</h1>
        <div className="card grid place-items-center p-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-soft)]">
            <Headphones className="h-6 w-6 text-[var(--brand-text)]" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-[var(--text-strong)]">
            مركز الدعم متاح بعد تسجيل الدخول
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            افتح تذكرة وتابع ردود فريق الدعم على حسابك
          </p>
          <Link href="/login?next=/support" className="btn btn-primary mt-5">
            سجّل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-bookly max-w-2xl py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">الدعم والمساعدة</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            افتح تذكرة وسيرد عليك فريق الدعم — تابع التذاكر السابقة هنا
          </p>
        </div>
      </div>

      {/* فتح تذكرة */}
      <form onSubmit={submit} className="card mb-8 p-5">
        <h2 className="font-display text-base font-bold text-[var(--text-strong)]">تذكرة جديدة</h2>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="label">الموضوع</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: لم يصلني رمز تأكيد الحجز"
              className="input"
            />
          </div>
          <div>
            <label className="label">التصنيف</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الرسالة</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="اشرح مشكلتك بالتفصيل — رقم الحجز إن وُجد يسرّع الرد"
              className="input resize-none"
            />
          </div>
        </div>
        {error ? (
          <p className="alert-danger alert-enter mt-3">{error}</p>
        ) : null}
        <button type="submit" disabled={sending} className="btn btn-primary mt-4">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {sending ? 'جارٍ الإرسال…' : 'فتح التذكرة'}
        </button>
      </form>

      {/* التذاكر */}
      <h2 className="font-display text-base font-bold text-[var(--text-strong)]">تذاكري</h2>
      {loading ? (
        <div className="grid h-32 place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--brand)]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card mt-3 grid place-items-center p-10 text-center">
          <Headphones className="h-8 w-8 text-[var(--ink-300)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">لا توجد تذاكر حتى الآن</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {tickets.map((t) => {
            const isOpen = open === t.id;
            return (
              <div key={t.id} className="card divide-y divide-[var(--border-subtle)] p-0" data-open={isOpen}>
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-[var(--bg-soft)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--text-strong)]">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {new Date(t.createdAt).toLocaleDateString('ar-IQ')} ·{' '}
                      {CATEGORIES.find((c) => c.key === t.category)?.label ?? t.category} ·{' '}
                      {t.messages?.length ?? 0} رسالة
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[t.status] ?? ''}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                  <ChevronDown className="accordion-icon h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                </button>

                <div className="accordion" data-open={isOpen}>
                  <div>
                    <div className="space-y-3 p-4">
                      {(t.messages ?? []).map((m, i) => (
                        <div
                          key={m.id ?? i}
                          className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${
                            m.senderId === user?.id
                              ? 'ms-auto bg-[var(--brand)] text-white'
                              : 'bg-[var(--bg-soft)] text-[var(--text-body)]'
                          }`}
                        >
                          <p>{m.body}</p>
                          <p className={`mt-1 text-[10px] ${m.senderId === user?.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                            {new Date(m.createdAt).toLocaleString('ar-IQ')}
                          </p>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="اكتب ردًا…"
                          className="input flex-1"
                        />
                        <button type="button" onClick={() => sendReply(t.id)} className="btn btn-soft !px-3">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
