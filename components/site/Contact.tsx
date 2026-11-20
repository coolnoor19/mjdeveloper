"use client";
import { useState } from "react";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import { Check, Copy, Mail, Phone, Pin } from "./icons";
import { Reveal, SectionHeading } from "./Reveal";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard blocked: the link next to it still works */
        }
      }}
      aria-label={done ? "Copied" : `Copy ${label}`}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/10 text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {done ? <Check className="size-4 text-leaf" /> : <Copy className="size-4" />}
    </button>
  );
}

export function Contact() {
  const { email, phone, phoneHref, address } = site.contact;
  const items = [
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}`, copy: email },
    { icon: Phone, label: "Phone", value: phone, href: `tel:${phoneHref}`, copy: phone },
    { icon: Pin, label: "Office", value: address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, external: true },
  ];

  return (
    <section id="contact" className="relative bg-paper-2 py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 [&>*]:min-w-0">
        <div>
          <SectionHeading
            eyebrow="Contact us"
            title={["Start with a", <span key="c" className="font-serif font-normal italic text-brand">conversation.</span>]}
            sub="Tell us about your site or idea. We reply within two working days."
          />
          <ul className="mt-10 flex flex-col gap-3">
            {items.map((it, i) => (
              <Reveal as="li" key={it.label} delay={0.1 + i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-card p-4 transition-colors hover:border-ink/30">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink text-paper">
                    <it.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">{it.label}</span>
                    <a
                      href={it.href}
                      {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-0.5 block font-semibold underline-offset-4 [overflow-wrap:anywhere] hover:underline"
                    >
                      {it.value}
                    </a>
                  </div>
                  {it.copy && <CopyButton text={it.copy} label={it.label.toLowerCase()} />}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
