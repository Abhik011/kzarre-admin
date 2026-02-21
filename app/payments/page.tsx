"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
type TabType =
  | "transactions"
  | "gateways"
  | "reconciliation"
  | "tax-fraud";

export default function PaymentsFinancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("transactions");

  const [stats, setStats] = useState({
    revenue: 0,
    fees: 0,
    net: 0,
    fraud: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Simulated fetch (replace with API)
  useEffect(() => {
    setStats({
      revenue: 25480,
      fees: 1240,
      net: 24240,
      fraud: 3,
    });

    setTransactions([
      {
        id: "ORD-8721",
        status: "paid",
        risk: "low",
        tax: 24,
        amount: 500,
        net: 476,
        gateway: "Stripe",
      },
      {
        id: "ORD-8822",
        status: "pending",
        risk: "medium",
        tax: 12,
        amount: 300,
        net: 288,
        gateway: "PayPal",
      },
      {
        id: "ORD-8891",
        status: "failed",
        risk: "high",
        tax: 0,
        amount: 1200,
        net: 0,
        gateway: "Klarna",
      },
    ]);
  }, []);

  const badge = (type: string) => {
    if (type === "paid")
      return "bg-[var(--accent-green)] text-green-700";
    if (type === "pending")
      return "bg-yellow-100 text-yellow-700";
    if (type === "failed")
      return "bg-red-100 text-red-700";
    return "bg-gray-100";
  };

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments & Finance</h1>
          <p className="text-sm text-gray-500">
            Manage gateways, reconciliation, tax & fraud
          </p>
        </div>
      </div>

      {/* ✅ Tabs */}
      <div className="flex gap-6 border-b pb-2">
        {["transactions", "gateways", "reconciliation", "tax-fraud"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`text-sm font-medium ${
                activeTab === tab
                  ? "text-[var(--accent-green)] border-b-2 !border-[var(--accent-green)]"
                  : "text-gray-500"
              }`}
            >
              {tab.replace("-", " & ").toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${stats.revenue}`} />
        <StatCard title="Gateway Fees" value={`$${stats.fees}`} />
        <StatCard title="Net Payout" value={`$${stats.net}`} />
        <StatCard title="Fraud Blocked" value={stats.fraud} />
      </div>

      {/* ================= TRANSACTIONS ================= */}
      {activeTab === "transactions" && (
        <div className="border rounded-xl overflow-hidden">
          <div className="p-4 font-semibold">Transaction List</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Tax</th>
                <th>Amount</th>
                <th>Net</th>
                <th>Gateway</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.id}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${badge(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.risk}</td>
                  <td>${t.tax}</td>
                  <td>${t.amount}</td>
                  <td>${t.net}</td>
                  <td>{t.gateway}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= GATEWAYS ================= */}
      {activeTab === "gateways" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GatewayCard title="Stripe" />
          <GatewayCard title="PayPal" />
          <GatewayCard title="Affirm / Klarna" />
          <GatewayCard title="ACH / Bank Transfer" />
        </div>
      )}

      {/* ================= RECONCILIATION ================= */}
      {activeTab === "reconciliation" && (
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Monthly Reconciliation</h3>
          <div className="flex gap-4">
            <input
              type="month"
              className="border rounded px-3 py-2 text-sm"
            />
            <button className="bg-[var(--accent-green)] text-white px-4 py-2 rounded">
              Generate
            </button>
            <button className="border px-4 py-2 rounded">
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* ================= TAX & FRAUD ================= */}
      {activeTab === "tax-fraud" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingToggle label="Enable AVS" />
          <SettingToggle label="Enable CVV" />
          <SettingToggle label="Velocity Checks" />
          <SettingToggle label="Tax Automation (Avalara/TaxJar)" />
        </div>
      )}
    </div>
  );
}

/* ================= UI Components ================= */

function StatCard({ title, value }: any) {
  return (
    <div className="border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function GatewayCard({ title }: any) {
  return (
    <div className="border rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">{title}</h4>
        <input type="checkbox" />
      </div>
      <input
        placeholder="API Key"
        className="w-full border rounded px-3 py-2 mb-2 text-sm"
      />
      <input
        placeholder="Account ID"
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

function SettingToggle({ label }: any) {
  return (
    <div className="border rounded-xl p-4 flex justify-between items-center">
      <span>{label}</span>
      <input type="checkbox" />
    </div>
  );
}
