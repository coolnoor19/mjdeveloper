"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { site } from "@/lib/site";
import { Phone } from "./icons";

/** Phones only: a call button appears once the visitor has scrolled past the hero. */
export function CallButton() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const contact = document.getElementById("contact");
    const nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
    setShow(y > 600 && !nearContact);
  });
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={`tel:${site.contact.phoneHref}`}
          aria-label={`Call ${site.contact.phone}`}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex items-center gap-2 rounded-full bg-brand py-3.5 pl-4 pr-5 font-semibold text-white shadow-[0_12px_30px_-8px_var(--color-brand)] md:hidden"
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <Phone className="size-5" /> Call us
        </motion.a>
      )}
    </AnimatePresence>
  );
}
