"use client";
import { useEffect, useState } from "react";

/* ================================
   TYPES
================================ */
interface Subscriber {
  _id: string;
  email: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
}

interface SeoItem {
  _id: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
}

interface AuditLog {
  _id: string;
  type: string;
  action: string;
  amount?: number;
}

interface User {
  _id: string;
  email: string;
}

/* ================================
   MAIN MARKETING PAGE
================================ */
export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("campaign");

  // ✅ CAMPAIGN
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  // ✅ SEO
  const [seo, setSeo] = useState<SeoItem[]>([]);
  const [seoForm, setSeoForm] = useState({
    page: "",
    metaTitle: "",
    metaDescription: "",
  });

  // ✅ ADS
  const [ads, setAds] = useState({
    facebookPixel: "",
    googleTagManager: "",
    tiktokPixel: "",
  });

  // ✅ AUDIT
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [staleUsers, setStaleUsers] = useState<User[]>([]);

  /* ================================
     FETCH HANDLERS
  ================================ */
  useEffect(() => {
    fetchCampaign();
    fetchSEO();
    fetchAds();
    fetchAudit();
  }, []);

  const fetchCampaign = async () => {
    try {
      // ✅ SUBSCRIBERS
      const s = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/campaign/subscribers`,
        { credentials: "include" }
      );

      const sData = await s.json();

      // ✅ GUARANTEE ARRAY
      setSubscribers(Array.isArray(sData) ? sData : []);

      // ✅ LEADS
      const l = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/campaign/leads`,
        { credentials: "include" }
      );

      const lData = await l.json();

      // ✅ GUARANTEE ARRAY
      setLeads(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error("fetchCampaign error:", err);
      setSubscribers([]);
      setLeads([]);
    }
  };

  const createNewsletter = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/campaign/newsletter`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, content }),
      }
    );
    alert("Newsletter Created");
    setSubject("");
    setContent("");
  };

  const fetchSEO = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/seo`,
      { credentials: "include" }
    );
    setSeo(await res.json());
  };

  const saveSEO = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/seo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(seoForm),
      }
    );
    fetchSEO();
    setSeoForm({ page: "", metaTitle: "", metaDescription: "" });
  };

  const fetchAds = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/ads`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (data) setAds(data);
  };

  const saveAds = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/ads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ads),
      }
    );
    alert("Ad Config Saved");
  };

  const fetchAudit = async () => {
    const logRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/audit/logs`,
      { credentials: "include" }
    );
    setLogs(await logRes.json());

    const staleRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/audit/stale-accounts`,
      { credentials: "include" }
    );
    setStaleUsers(await staleRes.json());
  };

  /* ================================
     UI
  ================================ */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Marketing Dashboard</h1>

      {/* ✅ TABS */}
      <div className="flex gap-4 border-b pb-3">
        <button onClick={() => setActiveTab("campaign")}>Campaign</button>
        <button onClick={() => setActiveTab("seo")}>SEO</button>
        <button onClick={() => setActiveTab("ads")}>Ad Integrations</button>
        <button onClick={() => setActiveTab("audit")}>Audit</button>
      </div>

      {/* ✅ CAMPAIGN TAB */}
      {activeTab === "campaign" && (
        <div className="space-y-6">
          <div className="border p-4 rounded-xl space-y-3">
            <input
              className="border p-2 w-full"
              placeholder="Newsletter Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              className="border p-2 w-full"
              placeholder="Newsletter Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={createNewsletter}
              className="bg-[var(--background-card)] border border-[var(--sidebar-border)] text-white px-4 py-2 rounded"
            >
              Create Newsletter
            </button>
          </div>

          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Subscribers</h3>
            {subscribers.map((s) => (
              <div key={s._id}>{s.email}</div>
            ))}
          </div>

          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Leads</h3>
            {leads.map((l) => (
              <div key={l._id}>
                {l.name} - {l.email}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ SEO TAB */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="border p-4 rounded-xl space-y-3">
            <input
              className="border p-2 w-full"
              placeholder="Page"
              value={seoForm.page}
              onChange={(e) => setSeoForm({ ...seoForm, page: e.target.value })}
            />
            <input
              className="border p-2 w-full"
              placeholder="Meta Title"
              value={seoForm.metaTitle}
              onChange={(e) =>
                setSeoForm({ ...seoForm, metaTitle: e.target.value })
              }
            />
            <textarea
              className="border p-2 w-full"
              placeholder="Meta Description"
              value={seoForm.metaDescription}
              onChange={(e) =>
                setSeoForm({
                  ...seoForm,
                  metaDescription: e.target.value,
                })
              }
            />
            <button
              onClick={saveSEO}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save SEO
            </button>
          </div>

          {seo.map((s) => (
            <div key={s._id} className="border p-3 rounded">
              <b>{s.page}</b> — {s.metaTitle}
            </div>
          ))}
        </div>
      )}

      {/* ✅ ADS TAB */}
      {activeTab === "ads" && (
        <div className="space-y-4 max-w-xl">
          <input
            className="border p-2 w-full"
            placeholder="Facebook Pixel ID"
            value={ads.facebookPixel}
            onChange={(e) =>
              setAds({ ...ads, facebookPixel: e.target.value })
            }
          />
          <input
            className="border p-2 w-full"
            placeholder="Google Tag Manager ID"
            value={ads.googleTagManager}
            onChange={(e) =>
              setAds({ ...ads, googleTagManager: e.target.value })
            }
          />
          <input
            className="border p-2 w-full"
            placeholder="TikTok Pixel ID"
            value={ads.tiktokPixel}
            onChange={(e) => setAds({ ...ads, tiktokPixel: e.target.value })}
          />
          <button
            onClick={saveAds}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Ad Settings
          </button>
        </div>
      )}

      {/* ✅ AUDIT TAB */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold mb-2">WORM Audit Logs</h3>
            {logs.map((l) => (
              <div key={l._id} className="border-b py-1 text-sm">
                {l.type} — {l.action} — ₹{l.amount || 0}
              </div>
            ))}
          </div>

          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Stale Accounts</h3>
            {staleUsers.map((u) => (
              <div key={u._id}>{u.email}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
