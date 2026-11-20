"use client";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { faqs, site } from "@/lib/site";
import { Phone, Plus } from "./icons";
import { Reveal, SectionHeading } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="border-b border-ink/15">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold md:text-xl"
        >
          {q}
          <span className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${open ? "rotate-45 border-brand bg-brand text-white" : "border-ink/15"}`}>
            <Plus className="size-5" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pr-12 text-base leading-relaxed text-muted md:text-lg">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="wrap py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="Common questions" title={["Good to know", "before we talk."]} />
          <Reveal delay={0.15}>
            <div className="mt-8 rounded-3xl bg-ink p-7 text-paper">
              <p className="font-display text-xl font-bold">Still have a question?</p>
              <p className="mt-2 text-paper/70">Call us during working hours, or send a message and we will reply within two working days.</p>
              <a href={`tel:${site.contact.phoneHref}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 font-semibold text-ink transition-colors hover:bg-brand hover:text-white">
                <Phone className="size-4" /> {site.contact.phone}
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal className="border-t border-ink/15">
          {faqs.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
