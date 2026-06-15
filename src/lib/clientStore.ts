import { demoReport } from "@/data/demoReport";
import type { VenueIQReport } from "@/lib/reportSchema";

export type ClientStatus = "active" | "pending" | "completed" | "on_hold";

export interface Note {
  id: string;
  createdAt: string;
  adminEmail: string;
  noteText: string;
}

export interface ActivityEntry {
  id: string;
  createdAt: string;
  adminEmail: string;
  actionType:
    | "client_created"
    | "report_generated"
    | "json_updated"
    | "note_added"
    | "link_shared"
    | "pdf_exported"
    | "status_changed";
  description: string;
}

export interface Client {
  id: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  venueName: string;
  address: string;
  city: string;
  venueType: string;
  contactEmail: string;
  servicePlan: string;
  status: ClientStatus;
  reportJson: VenueIQReport | null;
  nextReportDue: string | null;
  healthScore: number | null;
  overallRating: string | null;
  reportsCount: number;
  isPublished: boolean;
  notes: Note[];
  activity: ActivityEntry[];
}

const STORAGE_KEY = "venueiq.clients.v1";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function demoClient(): Client {
  const now = new Date().toISOString();
  return {
    id: "demo-bagel",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updatedAt: now,
    slug: "bagel-shop-demo",
    venueName: "The Bagel Shop",
    address: "1659 3rd Avenue",
    city: "New York, NY",
    venueType: "Bagel Shop · Breakfast & Brunch",
    contactEmail: "owner@thebagelshop.com",
    servicePlan: "Full Intelligence Suite",
    status: "active",
    reportJson: demoReport,
    nextReportDue: todayPlus(5),
    healthScore: 72,
    overallRating: "4.3 ★",
    reportsCount: 3,
    isPublished: true,
    notes: [
      {
        id: uid(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        adminEmail: "team@venueiq.co",
        noteText: "Owner confirmed card terminal replacement ordered — expected Friday. Re-check next report.",
      },
      {
        id: uid(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        adminEmail: "team@venueiq.co",
        noteText: "Pitched weekend FOH addition — owner wants to A/B test for 2 weeks before committing.",
      },
      {
        id: uid(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        adminEmail: "team@venueiq.co",
        noteText: "Click & collect pilot launching next month via Square. Will need follow-up sentiment scan in 60 days.",
      },
    ],
    activity: [
      { id: uid(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), adminEmail: "team@venueiq.co", actionType: "client_created", description: "Client onboarded" },
      { id: uid(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), adminEmail: "team@venueiq.co", actionType: "report_generated", description: "First intelligence report generated" },
      { id: uid(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), adminEmail: "team@venueiq.co", actionType: "note_added", description: "Note added about card terminal" },
      { id: uid(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), adminEmail: "team@venueiq.co", actionType: "link_shared", description: "Report URL shared with owner" },
      { id: uid(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), adminEmail: "team@venueiq.co", actionType: "json_updated", description: "Refreshed report with new month of reviews" },
    ],
  };
}

function loadAll(): Client[] {
  if (typeof window === "undefined") return [demoClient()];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = [demoClient()];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Client[];
  } catch {
    return [demoClient()];
  }
}

function saveAll(clients: Client[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export const clientStore = {
  list(): Client[] {
    return loadAll();
  },
  get(id: string): Client | undefined {
    return loadAll().find((c) => c.id === id);
  },
  getBySlug(slug: string): Client | undefined {
    return loadAll().find((c) => c.slug === slug);
  },
  create(input: Omit<Client, "id" | "createdAt" | "updatedAt" | "notes" | "activity" | "reportsCount" | "isPublished" | "healthScore" | "overallRating">): Client {
    const all = loadAll();
    const now = new Date().toISOString();
    const client: Client = {
      ...input,
      id: uid(),
      createdAt: now,
      updatedAt: now,
      reportsCount: input.reportJson ? 1 : 0,
      isPublished: false,
      healthScore: input.reportJson?.sidebar.healthScore ?? null,
      overallRating: input.reportJson?.sidebar.googleRating ?? null,
      notes: [],
      activity: [
        {
          id: uid(), createdAt: now, adminEmail: getAdminEmail() ?? "admin",
          actionType: "client_created", description: `Client ${input.venueName} created`,
        },
      ],
    };
    all.unshift(client);
    saveAll(all);
    return client;
  },
  update(id: string, patch: Partial<Client>): Client | undefined {
    const all = loadAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    if (patch.reportJson) {
      all[idx].healthScore = patch.reportJson.sidebar.healthScore;
      all[idx].overallRating = patch.reportJson.sidebar.googleRating;
    }
    saveAll(all);
    return all[idx];
  },
  addNote(id: string, noteText: string): Client | undefined {
    const all = loadAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const note: Note = {
      id: uid(), createdAt: new Date().toISOString(),
      adminEmail: getAdminEmail() ?? "admin", noteText,
    };
    all[idx].notes.unshift(note);
    all[idx].activity.unshift({
      id: uid(), createdAt: note.createdAt, adminEmail: note.adminEmail,
      actionType: "note_added", description: "Note added",
    });
    all[idx].updatedAt = note.createdAt;
    saveAll(all);
    return all[idx];
  },
  logActivity(id: string, actionType: ActivityEntry["actionType"], description: string) {
    const all = loadAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx].activity.unshift({
      id: uid(), createdAt: new Date().toISOString(),
      adminEmail: getAdminEmail() ?? "admin", actionType, description,
    });
    saveAll(all);
  },
  delete(id: string) {
    saveAll(loadAll().filter((c) => c.id !== id));
  },
};

// --- admin "auth" (demo-only, localStorage) ---
const AUTH_KEY = "venueiq.admin.v1";
export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_KEY);
}
export function adminLogin(email: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(AUTH_KEY, email);
}
export function adminLogout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(AUTH_KEY);
}
export function isAdmin(): boolean {
  return !!getAdminEmail();
}
