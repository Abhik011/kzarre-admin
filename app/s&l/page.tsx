"use client";

import React, { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */

interface CarrierConfig {
  enabled?: boolean;
  apiKey?: string;
  accountNumber?: string;
  labelFormat?: string;
  defaultService?: string;
}

interface ShippingSettings {
  ups?: CarrierConfig;
  fedex?: CarrierConfig;
  dhl?: CarrierConfig;
  defaultCarrier?: string;
}

interface ReturnItem {
  _id: string;
  status: string;
}

/* =========================
   CARRIER CONFIG FORM
========================= */

interface CarrierConfigFormProps {
  label: string;
  config: CarrierConfig;
  onChange: (config: CarrierConfig) => void;
}

function CarrierConfigForm({
  label,
  config,
  onChange,
}: CarrierConfigFormProps) {
  const handleChange = (field: keyof CarrierConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{label}</h3>
        <label className="flex items-center gap-2 text-sm">
          <span>Enabled</span>
          <input
            type="checkbox"
            checked={!!config.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">API Key</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            type="text"
            value={config.apiKey || ""}
            onChange={(e) => handleChange("apiKey", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Account Number</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            type="text"
            value={config.accountNumber || ""}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Label Format</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.labelFormat || "PDF"}
            onChange={(e) => handleChange("labelFormat", e.target.value)}
          >
            <option value="PDF">PDF</option>
            <option value="ZPL">ZPL</option>
            <option value="PNG">PNG</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Default Service</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            type="text"
            value={config.defaultService || ""}
            onChange={(e) =>
              handleChange("defaultService", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
   MAIN PAGE
========================= */

export default function ShippingAndLogisticsPage() {
  const [activeTab, setActiveTab] = useState("integration");

  // Shipping settings
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings | null>(
    null
  );
  const [defaultCarrier, setDefaultCarrier] = useState("");

  // Returns
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [returnsStatusFilter, setReturnsStatusFilter] =
    useState("pending");
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [updatingReturnId, setUpdatingReturnId] = useState<
    string | null
  >(null);

  /* =========================
     LOAD SETTINGS
  ========================= */

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/shipping/settings`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error(
          "Shipping Settings API Error:",
          res.status,
          errText
        );
        throw new Error("Failed to load settings");
      }

      const data = await res.json();
      setSettings(data);
      setDefaultCarrier(data.defaultCarrier || "");
    } catch (err) {
      console.error("fetchSettings ERROR:", err);
      alert("Failed to load shipping settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleCarrierChange = (
    carrierKey: keyof ShippingSettings,
    newConfig: CarrierConfig
  ) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            [carrierKey]: newConfig,
          }
        : prev
    );
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);

      const payload = {
        ups: settings?.ups || {},
        fedex: settings?.fedex || {},
        dhl: settings?.dhl || {},
        defaultCarrier,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/shipping/settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setSettings(data);
      setDefaultCarrier(data.defaultCarrier || "");
      alert("Shipping settings saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save shipping settings");
    } finally {
      setSavingSettings(false);
    }
  };

  /* =========================
     RETURNS
  ========================= */

  useEffect(() => {
    if (activeTab === "returns") {
      fetchReturns();
    }
  }, [activeTab, returnsStatusFilter]);

  const fetchReturns = async () => {
    try {
      setLoadingReturns(true);

      const url =
        returnsStatusFilter === "all"
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/returns`
          : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/returns?status=${returnsStatusFilter}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch returns");

      const data = await res.json();
      setReturns(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load return requests");
    } finally {
      setLoadingReturns(false);
    }
  };

  const updateReturnStatus = async (
    id: string,
    status: string,
    options: any = {}
  ) => {
    try {
      setUpdatingReturnId(id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/returns/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, ...options }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setReturns((prev) =>
        prev.map((r) => (r._id === id ? updated : r))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update return");
    } finally {
      setUpdatingReturnId(null);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Shipping & Logistics (S&L)
      </h1>

      <div className="flex gap-4 border-b pb-2">
        <button onClick={() => setActiveTab("integration")}>
          Integration & Labeling
        </button>
        <button onClick={() => setActiveTab("returns")}>
          Return Management
        </button>
      </div>

      {/* ====================== INTEGRATION ====================== */}
      {activeTab === "integration" && (
        <>
          {loadingSettings || !settings ? (
            <p>Loading settings...</p>
          ) : (
            <>
              <div>
                <label>Default Carrier</label>
                <select
                  value={defaultCarrier}
                  onChange={(e) =>
                    setDefaultCarrier(e.target.value)
                  }
                >
                  <option value="">None</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                </select>
              </div>

              <CarrierConfigForm
                label="UPS"
                config={settings.ups || {}}
                onChange={(c) => handleCarrierChange("ups", c)}
              />

              <CarrierConfigForm
                label="FedEx"
                config={settings.fedex || {}}
                onChange={(c) =>
                  handleCarrierChange("fedex", c)
                }
              />

              <CarrierConfigForm
                label="DHL"
                config={settings.dhl || {}}
                onChange={(c) => handleCarrierChange("dhl", c)}
              />

              <button onClick={handleSaveSettings}>
                {savingSettings
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </>
          )}
        </>
      )}

      {/* ====================== RETURNS ====================== */}
      {activeTab === "returns" && (
        <>
          <select
            value={returnsStatusFilter}
            onChange={(e) =>
              setReturnsStatusFilter(e.target.value)
            }
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>

          {loadingReturns ? (
            <p>Loading returns...</p>
          ) : (
            returns.map((r) => (
              <div key={r._id} className="border p-3 my-2">
                <p>Status: {r.status}</p>

                {r.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateReturnStatus(r._id, "approved", {
                          restockItems: true,
                        })
                      }
                    >
                      Approve & Restock
                    </button>

                    <button
                      onClick={() =>
                        updateReturnStatus(r._id, "denied")
                      }
                    >
                      Deny
                    </button>
                  </>
                )}

                {r.status === "approved" && (
                  <button
                    onClick={() =>
                      updateReturnStatus(
                        r._id,
                        "completed"
                      )
                    }
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
