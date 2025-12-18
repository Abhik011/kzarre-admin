"use client";

import React, { useState } from "react";

type TabType = "protection" | "data-requests" | "audit";

/* =========================
   TYPES
========================= */

interface ProtectionSettings {
  tokenizedPayments: boolean;
  pciMode: boolean;
  piiMasking: boolean;
  dbEncryption: boolean;
}

interface DataRequest {
  customerEmail: string;
  requestType: "export" | "delete";
}

interface AuditSettings {
  wormLogs: boolean;
  quarterlyAccessReview: boolean;
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/* =========================
   MAIN PAGE
========================= */

export default function SecurityCompliancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("protection");

  /* =========================
     DATA HYGIENE & PROTECTION
  ========================= */
  const [protection, setProtection] = useState<ProtectionSettings>({
    tokenizedPayments: true,
    pciMode: true,
    piiMasking: true,
    dbEncryption: true,
  });

  /* =========================
     GDPR / CCPA REQUEST STATE
  ========================= */
  const [request, setRequest] = useState<DataRequest>({
    customerEmail: "",
    requestType: "export",
  });

  /* =========================
     AUDIT & LOGGING
  ========================= */
  const [audit, setAudit] = useState<AuditSettings>({
    wormLogs: true,
    quarterlyAccessReview: true,
  });

  /* =========================
     HANDLERS
  ========================= */
  const saveProtectionSettings = () => {
    console.log("Protection Settings:", protection);
    alert("Data protection settings saved");
  };

  const submitDataRequest = () => {
    console.log("Data Request:", request);
    alert(`Customer data ${request.requestType} request submitted`);
  };

  const saveAuditSettings = () => {
    console.log("Audit Settings:", audit);
    alert("Audit & logging settings saved");
  };

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Security & Compliance</h1>
        <p className="text-sm text-gray-500">
          Data hygiene, privacy regulations & financial audit controls
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("protection")}
          className={`text-sm font-medium ${
            activeTab === "protection"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          DATA HYGIENE & PROTECTION
        </button>

        <button
          onClick={() => setActiveTab("data-requests")}
          className={`text-sm font-medium ${
            activeTab === "data-requests"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          GDPR / CCPA REQUESTS
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`text-sm font-medium ${
            activeTab === "audit"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          LOGGING & AUDIT
        </button>
      </div>

      {/* ================= DATA HYGIENE & PROTECTION ================= */}
      {activeTab === "protection" && (
        <div className="space-y-6 max-w-3xl">
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Data Hygiene & Protection
            </h3>

            <ToggleRow
              label="Tokenized Payments (Stripe / PayPal)"
              value={protection.tokenizedPayments}
              onChange={(v) =>
                setProtection({
                  ...protection,
                  tokenizedPayments: v,
                })
              }
            />

            <ToggleRow
              label="PCI Compliance Mode Enabled"
              value={protection.pciMode}
              onChange={(v) =>
                setProtection({ ...protection, pciMode: v })
              }
            />

            <ToggleRow
              label="PII Masking (Email, Phone, Address)"
              value={protection.piiMasking}
              onChange={(v) =>
                setProtection({ ...protection, piiMasking: v })
              }
            />

            <ToggleRow
              label="Database Encryption At Rest"
              value={protection.dbEncryption}
              onChange={(v) =>
                setProtection({ ...protection, dbEncryption: v })
              }
            />

            <button
              onClick={saveProtectionSettings}
              className="bg-[var(--accent-green)] text-white px-6 py-2 rounded-lg"
            >
              Save Protection Settings
            </button>
          </div>
        </div>
      )}

      {/* ================= GDPR / CCPA DATA REQUESTS ================= */}
      {activeTab === "data-requests" && (
        <div className="space-y-6 max-w-xl">
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Customer Data Requests (GDPR / CCPA)
            </h3>

            <div>
              <label className="block text-sm mb-1">
                Customer Email
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={request.customerEmail}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    customerEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Request Type
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={request.requestType}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    requestType: e.target.value as "export" | "delete",
                  })
                }
              >
                <option value="export">
                  Export Customer Data
                </option>
                <option value="delete">
                  Delete Customer Data
                </option>
              </select>
            </div>

            <button
              onClick={submitDataRequest}
              className="bg-[var(--accent-green)] text-white px-6 py-2 rounded-lg"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* ================= LOGGING & AUDIT ================= */}
      {activeTab === "audit" && (
        <div className="space-y-6 max-w-3xl">
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Logging & Financial Audit Controls
            </h3>

            <ToggleRow
              label="WORM Logs (Write-Once, Immutable)"
              value={audit.wormLogs}
              onChange={(v) =>
                setAudit({ ...audit, wormLogs: v })
              }
            />

            <ToggleRow
              label="Quarterly User Access Reviews"
              value={audit.quarterlyAccessReview}
              onChange={(v) =>
                setAudit({
                  ...audit,
                  quarterlyAccessReview: v,
                })
              }
            />

            <button
              onClick={saveAuditSettings}
              className="bg-[var(--accent-green)] text-white px-6 py-2 rounded-lg"
            >
              Save Audit Settings
            </button>
          </div>

          {/* ===== ACCESS REVIEW SECTION ===== */}
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3">
              Quarterly Access Review Summary
            </h3>

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Admin</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">admin@company.com</td>
                  <td>Super Admin</td>
                  <td>2 days ago</td>
                  <td className="text-green-600">Active</td>
                </tr>

                <tr className="border-t">
                  <td className="p-2">dev@company.com</td>
                  <td>Developer</td>
                  <td>92 days ago</td>
                  <td className="text-red-600">Stale</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI COMPONENT ================= */

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}
