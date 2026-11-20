import type { EnquiryDoc, EnquiryStatus, ProjectDoc } from "./db";

// Plain JSON shapes sent to the browser.

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: EnquiryStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  year: string;
  description: string;
  image: string;
  isPublished: boolean;
  sortOrder: number;
}

export function toEnquiry(d: EnquiryDoc): Enquiry {
  return {
    id: String(d._id),
    name: d.name,
    email: d.email,
    phone: d.phone,
    service: d.service,
    message: d.message,
    status: d.status,
    note: d.note ?? "",
    createdAt: d.createdAt.toISOString(),
    updatedAt: (d.updatedAt ?? d.createdAt).toISOString(),
  };
}

export function toProject(d: ProjectDoc): Project {
  return {
    id: String(d._id),
    title: d.title,
    location: d.location,
    category: d.category,
    year: d.year,
    description: d.description,
    image: `/api/images/${String(d.imageId)}`,
    isPublished: d.isPublished,
    sortOrder: d.sortOrder,
  };
}
