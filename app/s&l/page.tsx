"use client";

import React, { useEffect, useState } from "react";

/* =========================
   COOKIE TOKEN HELPER
========================= */
const getAuthTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )refresh_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

/* =========================
   TYPES (MATCH BACKEND)
========================= */
interface CourierPartner {
  _id: string;
  name: string;
  slug: string;
  enabled: boolean;
  environment: "sandbox" | "production";
  baseUrls: {
    sandbox?: string;
    production?: string;
  };
  auth: {
    type: "apiKey" | "bearer" | "basic" | "oauth2";
    apiKey?: string;
    token?: string;
    username?: string;
    password?: string;
  };
  endpoints: {
    rate?: string;
    shipment?: string;
    tracking?: string;
    cancel?: string;
  };
  currency: string;
}

interface AdminOrder {
  _id: string;
  orderId: string;
  status: string;
  amount: number;
  paymentMethod: string;
  shipment?: {
    carrier?: string;
    trackingId?: string;
    status?: string;
    labelUrl?: string;
  };
}

/* =========================
   MAIN PAGE
========================= */
export default function ShippingAndLogisticsPage() {
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const token = getAuthTokenFromCookie();

  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<CourierPartner>>({
    enabled: true,
    environment: "sandbox",
    currency: "USD",
    auth: { type: "apiKey" },
    baseUrls: {},
    endpoints: {},
  });

  /* =========================
     FETCH COURIERS
  ========================= */
  const fetchCouriers = async () => {
    const res = await fetch(`${API}/api/admin/couriers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setCouriers(await res.json());
  };

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async () => {
    const res = await fetch(`${API}/api/admin/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setOrders(await res.json());
  };

  useEffect(() => {
    fetchCouriers();
    fetchOrders();
  }, []);

  /* =========================
     SAVE COURIER
  ========================= */
  const saveCourier = async () => {
    if (!form.name || !form.slug) {
      alert("Courier name & slug required");
      return;
    }

    setSaving(true);

    await fetch(`${API}/api/admin/couriers/${form.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    });

    setForm({
      enabled: true,
      environment: "sandbox",
      currency: "USD",
      auth: { type: "apiKey" },
      baseUrls: {},
      endpoints: {},
    });

    fetchCouriers();
    setSaving(false);
  };

  /* =========================
     CREATE SHIPMENT
  ========================= */
  const createShipment = async (id: string, courier: string) => {
    await fetch(`${API}/api/admin/orders/${id}/ship`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ courier }),
    });
    fetchOrders();
  };

  /* =========================
     CANCEL ORDER
  ========================= */
  const cancelOrder = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    await fetch(`${API}/api/admin/orders/${id}/cancel`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchOrders();
  };

  /* =========================
     REFUND ORDER
  ========================= */
  const refundOrder = async (orderId: string) => {
    if (!confirm("Refund this order?")) return;
    await fetch(`${API}/api/checkout/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ orderId }),
    });
    fetchOrders();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Shipping & Logistics (Admin)</h1>

      {/* ================= COURIER FORM ================= */}
      <div className="border rounded-xl p-4 bg-[var(--background-card)]">
        <h2 className="font-semibold mb-3">Add / Update Courier</h2>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            placeholder="Courier Name"
            className="border px-3 py-2 rounded"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Slug (dhl, fedex, custom)"
            className="border px-3 py-2 rounded"
            value={form.slug || ""}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />

          <input
            placeholder="Sandbox Base URL"
            className="border px-3 py-2 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                baseUrls: { ...form.baseUrls, sandbox: e.target.value },
              })
            }
          />

          <input
            placeholder="Production Base URL"
            className="border px-3 py-2 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                baseUrls: { ...form.baseUrls, production: e.target.value },
              })
            }
          />

          <select
            className="border px-3 py-2 rounded"
            value={form.auth?.type}
            onChange={(e) =>
              setForm({
                ...form,
                auth: { ...form.auth, type: e.target.value as any },
              })
            }
          >
            <option value="apiKey">API Key</option>
            <option value="bearer">Bearer</option>
            <option value="basic">Basic</option>
            <option value="oauth2">OAuth2</option>
          </select>

          <input
            placeholder="API Key / Token"
            className="border px-3 py-2 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                auth: { ...form.auth, apiKey: e.target.value },
              })
            }
          />
        </div>

        <button
          onClick={saveCourier}
          disabled={saving}
          className="mt-4 px-5 py-2 bg-green-600 text-white rounded"
        >
          {saving ? "Saving..." : "Save Courier"}
        </button>
      </div>

      {/* ================= ORDERS ================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Orders & Shipments</h2>

        {orders.map((o) => (
          <div
            key={o._id}
            className="border rounded-xl p-4 bg-[var(--background-card)]"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">Order #{o.orderId}</h3>
                <p>Status: {o.status}</p>
                <p>Amount: ${o.amount}</p>

                {o.shipment?.trackingId && (
                  <>
                    <p>
                      Tracking ID: <b>{o.shipment.trackingId}</b>
                    </p>
                    <p>
                      Shipment Status:{" "}
                      <b>{o.shipment.status}</b>
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {!o.shipment?.trackingId && (
                  <select
                    className="border px-2 py-1 rounded"
                    defaultValue=""
                    onChange={(e) =>
                      createShipment(o._id, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Assign Courier
                    </option>
                    {couriers
                      .filter((c) => c.enabled)
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}

                {o.status !== "cancelled" && (
                  <button
                    onClick={() => cancelOrder(o._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Cancel Order
                  </button>
                )}

                {o.paymentMethod === "ONLINE" && (
                  <button
                    onClick={() => refundOrder(o.orderId)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded"
                  >
                    Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
