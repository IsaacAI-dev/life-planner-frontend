'use client';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { Reveal } from '@/components/marketing/Reveal';
import { FAQS } from '@/lib/marketing/content';

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  // Falls back to the handoff's own copy if the backend list isn't there yet —
  // unlike careers, there is no dishonesty risk in showing default FAQ copy.
  const { data } = useQuery({ queryKey: ['public-faqs'], queryFn: publicApi.faqs });
  const faqs = data && data.length > 0 ? data : FAQS;

  return (
    <section id="lp-faq" className="mx-auto mt-16 max-w-215 scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal>
        <h2
          className="mb-6.5 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.12] font-semibold sm:mb-10"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          Questions people actually ask.
        </h2>
      </Reveal>

      <Reveal className="flex flex-col gap-2.5">
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          return (
            <div
              key={faq.question}
              className="overflow-hidden rounded-[18px] border transition-colors"
              style={{ borderColor: isOpen ? 'var(--lp-ac)' : 'var(--lp-line-2)', background: 'var(--lp-surf)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center gap-4 px-5.5 py-4.75 text-left font-display text-[16.5px] font-semibold"
                style={{ color: 'var(--lp-tx)', letterSpacing: '-0.01em' }}
              >
                {faq.question}
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="ml-auto flex-none"
                  style={{ color: 'var(--lp-ac)' }}
                >
                  <ChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-5.5 pr-15 pb-5.25 text-[15.5px] leading-relaxed text-pretty"
                      style={{ color: 'var(--lp-tx-2)' }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
