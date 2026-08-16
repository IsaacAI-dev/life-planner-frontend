'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail, MailCheck, MapPin, Send, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { Kicker } from '@/components/marketing/Kicker';
import { Reveal } from '@/components/marketing/Reveal';
import { CONTACT } from '@/lib/marketing/content';
import { collectErrors, emailError, requiredError } from '@/lib/validation';

function ContactRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-9.5 flex-none items-center justify-center rounded-xl"
        style={{ background: 'var(--lp-pill)', border: '1px solid var(--lp-pill-bd)' }}
      >
        <Icon size={19} style={{ color: 'var(--lp-ac)' }} />
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-bold tracking-[0.1em]" style={{ color: 'var(--lp-tx-4)' }}>
          {label}
        </span>
        <span className="text-[15px]" style={{ color: 'var(--lp-tx-2)' }}>
          {value}
        </span>
      </span>
    </div>
  );
}

const fieldStyle = {
  background: 'var(--lp-surf-in)',
  border: '1px solid var(--lp-line-2)',
  color: 'var(--lp-tx)',
};

const errorFieldStyle = { ...fieldStyle, borderColor: 'var(--red-ink)' };

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(CONTACT.topics[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  // Office address is shown only when the backend actually has one to publish.
  const { data: contactInfo } = useQuery({ queryKey: ['public-contact'], queryFn: publicApi.contactInfo });
  const email_ = contactInfo?.email ?? CONTACT.email;
  const hours = contactInfo?.supportHours ?? CONTACT.hours;
  const officeAddress = contactInfo?.officeAddress;

  const submit = useMutation({
    mutationFn: () => publicApi.submitContact({ name, email, topic, message }),
  });

  const handleSubmit = () => {
    const fieldErrors = collectErrors({
      name: () => requiredError(name, 'name'),
      email: () => emailError(email),
      message: () => requiredError(message, 'message'),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    submit.mutate();
  };

  const reset = () => {
    submit.reset();
    setName('');
    setEmail('');
    setMessage('');
    setErrors({});
  };

  return (
    <section id="lp-contact" className="mx-auto mt-16 max-w-[1180px] scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-10 h-px sm:mb-16" style={{ background: 'var(--lp-rule)' }}>
        <span className="sr-only">.</span>
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 sm:gap-14">
        <Reveal className="flex max-w-115 flex-col gap-4">
          <Kicker>{CONTACT.kicker}</Kicker>
          <h2
            className="font-display text-[clamp(26px,3.4vw,40px)] leading-[1.13] font-semibold"
            style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
          >
            {CONTACT.h2}
          </h2>
          <p className="text-base leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
            {CONTACT.body}
          </p>
          <div className="mt-1.5 flex flex-col gap-3.5">
            <ContactRow icon={Mail} label="EMAIL" value={email_} />
            {hours ? <ContactRow icon={Clock} label="SUPPORT HOURS" value={hours} /> : null}
            {officeAddress ? <ContactRow icon={MapPin} label="POST" value={officeAddress} /> : null}
          </div>
        </Reveal>

        <Reveal className="rounded-[26px] border p-6 sm:p-8" style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}>
          {submit.isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span
                className="flex size-13.5 items-center justify-center rounded-full"
                style={{ background: 'var(--lp-pill)', border: '1px solid var(--lp-pill-bd)' }}
              >
                <MailCheck size={27} style={{ color: 'var(--lp-ac)' }} />
              </span>
              <div className="font-display text-[21px] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.015em' }}>
                Got it — thank you.
              </div>
              <p className="max-w-80 text-[15px]" style={{ color: 'var(--lp-tx-2)' }}>
                We&apos;ll reply to the address you gave us, usually well inside a working day.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-1.5 rounded-full border px-4.5 py-2.5 text-sm font-semibold"
                style={{ borderColor: 'var(--lp-line-str)', color: 'var(--lp-tx-2)' }}
              >
                Send another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.75">
              <label className="flex flex-col gap-1.75">
                <span className="text-[12.5px] font-bold tracking-[0.09em]" style={{ color: 'var(--lp-tx-3)' }}>
                  YOUR NAME
                </span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                  }}
                  placeholder="Ada Lovelace"
                  className="rounded-xl px-3.5 py-3 text-[15px] outline-none"
                  style={errors.name ? errorFieldStyle : fieldStyle}
                />
                {errors.name ? (
                  <span className="text-xs font-semibold" style={{ color: 'var(--red-ink)' }}>
                    {errors.name}
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1.75">
                <span className="text-[12.5px] font-bold tracking-[0.09em]" style={{ color: 'var(--lp-tx-3)' }}>
                  EMAIL
                </span>
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className="rounded-xl px-3.5 py-3 text-[15px] outline-none"
                  style={errors.email ? errorFieldStyle : fieldStyle}
                />
                {errors.email ? (
                  <span className="text-xs font-semibold" style={{ color: 'var(--red-ink)' }}>
                    {errors.email}
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1.75">
                <span className="text-[12.5px] font-bold tracking-[0.09em]" style={{ color: 'var(--lp-tx-3)' }}>
                  WHAT&apos;S IT ABOUT
                </span>
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="rounded-xl px-3.5 py-3 text-[15px] outline-none"
                  style={fieldStyle}
                >
                  {CONTACT.topics.map((option) => (
                    <option
                      key={option}
                      value={option}
                      style={{ background: 'var(--lp-surf-in)', color: 'var(--lp-tx)' }}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.75">
                <span className="text-[12.5px] font-bold tracking-[0.09em]" style={{ color: 'var(--lp-tx-3)' }}>
                  MESSAGE
                </span>
                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (errors.message) setErrors((current) => ({ ...current, message: undefined }));
                  }}
                  rows={5}
                  placeholder="Tell us as much or as little as you like…"
                  className="resize-y rounded-xl px-3.5 py-3 text-[15px] outline-none"
                  style={errors.message ? errorFieldStyle : fieldStyle}
                />
                {errors.message ? (
                  <span className="text-xs font-semibold" style={{ color: 'var(--red-ink)' }}>
                    {errors.message}
                  </span>
                ) : null}
              </label>

              {submit.isError || submit.data === null ? (
                <p className="text-[13px] font-semibold" style={{ color: 'var(--red-ink)' }}>
                  Couldn&apos;t send that just now — email {email_} directly instead.
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submit.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full py-3.25 font-display text-[15px] font-semibold disabled:opacity-60"
                style={{ background: 'var(--lp-grad)', color: '#141019' }}
              >
                {submit.isPending ? 'Sending…' : 'Send message'}
                <Send size={18} />
              </button>
              <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--lp-tx-4)' }}>
                By sending this you agree to our{' '}
                <Link href="/privacy" className="underline" style={{ color: 'var(--lp-ac)' }}>
                  privacy policy
                </Link>
                . We never sell your details.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
