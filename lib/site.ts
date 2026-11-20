// Site-wide content and contact details. Edit here; every section reads from this file.

export const site = {
  name: "MJ Developer",
  fullName: "MJ Developer Planning and Consultancy Services",
  tagline: "Planning. Feasibility. Delivery.",
  motto: "Make your dream colourful",
  description:
    "MJ Developer Planning and Consultancy Services guides property developers and landowners from first site idea to approved, buildable project.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mjdeveloper.in",
  contact: {
    email: "mjdeveloperodisha@gmail.com",
    phone: "+91 94398 66134",
    phoneHref: "+919439866134",
    address: "C-18 B (Khajapur), Khelar, Nimapada, Puri 752114, Odisha",
    replyTime: "We reply within two working days.",
  },
} as const;

export const nav = [
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
] as const;

/** Services offered in the contact form. The API validates submissions against this list. */
export const SERVICE_OPTIONS = [
  "Site feasibility study",
  "Master planning",
  "Planning applications",
  "Budgeting",
  "Project management",
  "Land acquisition",
  "Other",
] as const;
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export const services = [
  {
    key: "feasibility",
    title: "Site feasibility studies",
    body: "Zoning, access, utilities, constraints and yield, summarised in a clear go or no-go report.",
    points: ["Zoning and access", "Utilities and constraints", "Yield and return"],
  },
  {
    key: "masterplan",
    title: "Master planning and layout",
    body: "Efficient plot layouts, road networks and open space that maximise usable area and value.",
    points: ["Plot layouts", "Road networks", "Open space"],
  },
  {
    key: "permits",
    title: "Planning and permit applications",
    body: "We prepare documents, liaise with authorities and respond to queries until approval.",
    points: ["Document preparation", "Authority liaison", "Tracked to decision"],
  },
  {
    key: "budget",
    title: "Development budgeting",
    body: "Cost plans, cash-flow forecasts and sensitivity checks so funding decisions rest on numbers.",
    points: ["Cost plans", "Cash-flow forecasts", "Sensitivity checks"],
  },
  {
    key: "pm",
    title: "Project management advisory",
    body: "Contractor selection, programme review and progress monitoring on your behalf.",
    points: ["Contractor selection", "Programme review", "Progress monitoring"],
  },
  {
    key: "land",
    title: "Land acquisition advice",
    body: "Due diligence on title, risk and development potential before you commit to buy.",
    points: ["Title checks", "Risk review", "Development potential"],
  },
] as const;

export const highlights = [
  {
    art: "houses",
    kicker: "Residential",
    title: "Layouts that make every plot count",
    body: "Master plans that balance yield, access and open space, so your land earns its full value.",
  },
  {
    art: "plan",
    kicker: "Approvals",
    title: "Applications prepared and tracked to decision",
    body: "We compile the application, talk to the authorities and follow up until you have your permit.",
  },
  {
    art: "towers",
    kicker: "Feasibility",
    title: "Know if a site works before you buy it",
    body: "A clear feasibility report on zoning, utilities, risk and return, delivered before you commit.",
  },
] as const;

export const facts = [
  { value: "6", label: "Core planning services" },
  { value: "4", label: "Stages, each with a deliverable" },
  { value: "1", label: "Consultant from brief to handover" },
  { value: "2", label: "Working days to reply" },
] as const;

export const steps = [
  { title: "Brief", body: "We listen to your goals, budget and timeline.", deliverable: "Agreed scope" },
  { title: "Assess", body: "Site study and feasibility report.", deliverable: "Go / no-go report" },
  { title: "Plan", body: "Layout, costing and approval submission.", deliverable: "Submitted application" },
  { title: "Deliver", body: "Hand-over with ongoing advisory support.", deliverable: "Approved, buildable project" },
] as const;

export const faqs = [
  {
    q: "What happens after I send an enquiry?",
    a: "We read every enquiry and reply within two working days to arrange a first conversation about your site, goals, budget and timeline.",
  },
  {
    q: "What does a feasibility study cover?",
    a: "Zoning, access, utilities, constraints and yield. You get a clear go or no-go report before you spend money on design.",
  },
  {
    q: "Who do you work with?",
    a: "First-time developers, landowners and established firms, on residential, commercial and mixed-use projects.",
  },
  {
    q: "Can you handle the planning approval?",
    a: "Yes. We prepare the documents, liaise with the authorities and respond to their queries until a decision is made.",
  },
  {
    q: "Will I deal with the same person throughout?",
    a: "Yes. The same consultant stays with your project from the first brief to handover.",
  },
  {
    q: "Should I talk to you before buying land?",
    a: "Ideally, yes. Due diligence on title, risk and development potential is cheapest before you commit to buy.",
  },
] as const;
