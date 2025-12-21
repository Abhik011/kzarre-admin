"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Users,
  Search,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

/* ================= TYPES ================= */
interface Subscriber { _id: string; email: string }
interface Lead { _id: string; name: string; email: string }
interface SeoItem { _id: string; page: string; metaTitle: string }
interface AuditLog { _id: string; type: string; action: string; amount?: number }
interface User { _id: string; email: string }

/* ================= HELPERS ================= */
const asArray = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);

export default function MarketingPage() {
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const [activeTab, setActiveTab] =
    useState<"campaign" | "seo" | "audit">("campaign");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [seo, setSeo] = useState<SeoItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [staleUsers, setStaleUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    Promise.all([fetchCampaign(), fetchSEO(), fetchAudit()])
      .finally(() => setLoading(false));
  }, []);

  const fetchCampaign = async () => {
    try {
      const [sRes, lRes] = await Promise.all([
        fetch(`${API}/api/admin/campaign/subscribers`, { credentials: "include" }),
        fetch(`${API}/api/admin/campaign/leads`, { credentials: "include" }),
      ]);

      const s = await sRes.json();
      const l = await lRes.json();

      setSubscribers(asArray<Subscriber>(s?.subscribers || s));
      setLeads(asArray<Lead>(l?.leads || l));
    } catch {
      setSubscribers([]);
      setLeads([]);
    }
  };

  const fetchSEO = async () => {
    try {
      const r = await fetch(`${API}/api/admin/seo`, { credentials: "include" });
      const d = await r.json();
      setSeo(asArray<SeoItem>(d?.seo || d));
    } catch {
      setSeo([]);
    }
  };

  const fetchAudit = async () => {
    try {
      const [l, s] = await Promise.all([
        fetch(`${API}/api/admin/audit/logs`, { credentials: "include" }),
        fetch(`${API}/api/admin/audit/stale-accounts`, { credentials: "include" }),
      ]);

      const logsData = await l.json();
      const staleData = await s.json();

      setLogs(asArray<AuditLog>(logsData?.logs || logsData));
      setStaleUsers(asArray<User>(staleData?.users || staleData));
    } catch {
      setLogs([]);
      setStaleUsers([]);
    }
  };

  /* ================= KPIs ================= */
  const revenue = useMemo(() => {
    if (!Array.isArray(logs)) return 0;
    return logs.reduce((sum, l) => sum + (l.amount || 0), 0);
  }, [logs]);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-1 space-y-8">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Marketing Control Center
          </h1>
          <p className="text-gray-500">
            Campaigns, SEO authority & compliance overview
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/emailtemplate"
            className="px-4 py-2 rounded-lg border bg-[var(--accent-green)]hover:bg-gray-100 transition"
          >
            + Email Template
          </Link>
          <button className="px-6 py-2 rounded-lg bg-[var(--accent-green)] text-white hover:bg-gray-800 transition">
            + New Campaign
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-5">
        <Kpi icon={<Users />} title="Subscribers" value={subscribers.length} />
        <Kpi icon={<Megaphone />} title="Leads" value={leads.length} />
        <Kpi icon={<Search />} title="SEO Pages" value={seo.length} />
        <Kpi icon={<ShieldCheck />} title="Audit Logs" value={logs.length} />
        <Kpi icon={<Mail />} title="Revenue Impact" value={`₹${revenue}`} />
      </section>

      {/* TABS */}
      <div className="sticky top-0 bg-gray-50 z-10 border-b">
        <div className="flex gap-8">
          {["campaign", "seo", "audit"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 font-medium transition ${
                activeTab === tab
                  ?  "text-[var(--accent-green)] border-b-2 !border-[var(--accent-green)]"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <Skeleton />
      ) : (
        <>
          {activeTab === "campaign" && (
            <div className="grid md:grid-cols-2 gap-6">
              <TableCard title="Subscribers" subtitle="Active email opt-ins">
                <List
                  data={subscribers}
                  empty="No subscribers yet"
                  render={s => s.email}
                />
              </TableCard>

              <TableCard title="Leads" subtitle="Captured prospects">
                <List
                  data={leads}
                  empty="No leads captured"
                  render={l => `${l.name} — ${l.email}`}
                />
              </TableCard>
            </div>
          )}

          {activeTab === "seo" && (
            <TableCard title="SEO Pages" subtitle="Indexed & optimized pages">
              <List
                data={seo}
                empty="No SEO pages found"
                render={s => (
                  <>
                    <b>{s.page}</b>
                    <span className="text-gray-500"> — {s.metaTitle}</span>
                  </>
                )}
              />
            </TableCard>
          )}

          {activeTab === "audit" && (
            <div className="grid md:grid-cols-2 gap-6">
              <TableCard title="Audit Logs" subtitle="Financial & action trail">
                <List
                  data={logs}
                  empty="No audit logs"
                  render={l => (
                    <>
                      {l.type} — {l.action}
                      <span className="float-right font-medium">
                        ₹{l.amount || 0}
                      </span>
                    </>
                  )}
                />
              </TableCard>

              <TableCard title="Inactive Accounts" subtitle="Compliance cleanup">
                <List
                  data={staleUsers}
                  empty="No inactive users"
                  render={u => u.email}
                />
              </TableCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Kpi({ title, value, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
      <div className="p-3 rounded-xl bg-gray-100">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function TableCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto divide-y">
        {children}
      </div>
    </div>
  );
}

function List<T extends { _id: string }>({
  data,
  render,
  empty,
}: {
  data: T[];
  render: (item: T) => React.ReactNode;
  empty: string;
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        {empty}
      </p>
    );
  }

  return data.map(item => (
    <div key={item._id} className="py-2 text-sm">
      {render(item)}
    </div>
  ));
}


function Skeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div
          key={i}
          className="h-64 bg-gray-200 animate-pulse rounded-xl"
        />
      ))}
    </div>
  );
}
