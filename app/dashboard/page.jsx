"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import ProtectedRoute from "@/components/ProtectedRoute";

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, isPositive, bgColor }) => (
  <div
    className="
      bg-[var(--background-card)]
      border border-[var(--sidebar-border)]
      rounded-2xl p-6 shadow-sm transition
    "
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[var(--text-secondary)] text-sm">{title}</p>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] mt-2">
          {value}
        </h3>

        <p
          className={`
          text-sm mt-2 flex items-center gap-1
          ${isPositive ? "text-teal-500" : "text-red-500"}
        `}
        >
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </p>
      </div>

      <div className={`p-4 rounded-lg flex-shrink-0 ${bgColor}`}>
        <Icon size={28} className="text-[var(--text-primary)]" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [role, setRole] = useState(null);

  // 👉 Analytics States
  const [summary, setSummary] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [usersType, setUsersType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRole(localStorage.getItem("role"));

    const fetchAnalytics = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        const [summaryRes, trafficRes, usersTypeRes] = await Promise.all([
          fetch(`${base}/api/analytics/summary`),
          fetch(`${base}/api/analytics/traffic/daily`),
          fetch(`${base}/api/analytics/users/type`),
        ]);

        const s = await summaryRes.json();
        const t = await trafficRes.json();
        const u = await usersTypeRes.json();

        if (s.success) setSummary(s.summary);

        if (t.success)
          setTrafficData(
            t.traffic.map((x) => ({
              name: x._id,
              value: x.visits,
            }))
          );

        if (u.success) setUsersType(u);

      } catch (err) {
        console.error("❌ Analytics failed:", err);
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  const canViewSales = role === "superadmin" || role === "admin";
  const canViewDeals = role === "superadmin" || role === "admin";
  const canViewUsers = role === "superadmin" || role === "admin";

  if (loading)
    return (
      <div className="p-10 text-center text-[var(--text-secondary)]">
        Loading analytics…
      </div>
    );

  return (
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition">

        {/* Top Title Row */}
        <div className="pb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <span className="text-sm text-[var(--text-secondary)]">Role: {role}</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-12">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            
            {/* Users */}
            <StatCard
              title="Total Users"
              value={summary?.totalUsers || 0}
              change={`${usersType?.newUsers || 0} New`}
              icon={Users}
              isPositive={true}
              bgColor="bg-blue-300/20"
            />

            {/* Orders */}
            {canViewUsers && (
              <StatCard
                title="Total Orders"
                value={summary?.totalOrders || 0}
                change="Orders processed"
                icon={ShoppingCart}
                isPositive={true}
                bgColor="bg-yellow-300/20"
              />
            )}

            {/* Sales */}
            {canViewSales && (
              <StatCard
                title="Total Revenue"
                value={`₹${summary?.totalRevenue || 0}`}
                change="↑ Performance"
                icon={TrendingUp}
                isPositive={true}
                bgColor="bg-green-300/20"
              />
            )}

            {/* Pending */}
            <StatCard
              title="New Users (24h)"
              value={summary?.newUsers || 0}
              change="Last 24 hours"
              icon={Clock}
              isPositive={true}
              bgColor="bg-orange-300/20"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

            {/* Website Traffic */}
            <div className="bg-[var(--background-card)] border border-[var(--sidebar-border)] rounded-2xl p-6 shadow">
              <h3 className="text-lg font-bold mb-4">Website Traffic</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebar-border)" />
                  <XAxis stroke="var(--text-secondary)" dataKey="name" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: "var(--background-card)", border: "1px solid var(--sidebar-border)" }} />
                  <Line type="monotone" dataKey="value" stroke="#6d5bf3" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* New vs Returning Users */}
            {canViewUsers && (
              <div className="bg-[var(--background-card)] border border-[var(--sidebar-border)] rounded-2xl p-6 shadow">
                <h3 className="text-lg font-bold mb-4">New vs Returning Users</h3>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Users",
                        New: usersType?.newUsers || 0,
                        Returning: usersType?.returningUsers || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebar-border)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ background: "var(--background-card)", border: "1px solid var(--sidebar-border)" }} />
                    <Legend />
                    <Bar dataKey="New" fill="#a78bfa" />
                    <Bar dataKey="Returning" fill="#fb7185" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
        {/* Deals Table */}
{/* {canViewDeals && (
  <div className="bg-[var(--background-card)] border border-[var(--sidebar-border)] rounded-2xl p-6 shadow">

    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold">Deals Details</h3>
      <button className="px-4 py-2 border border-[var(--sidebar-border)] text-[var(--text-primary)] rounded-lg bg-[var(--background-card)] hover:bg-[var(--background)]">
        October ▼
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--sidebar-border)] bg-[var(--background)]">
            {["Product Name", "Location", "Date - Time", "Piece", "Amount", "Status"].map((head) => (
              <th key={head}
                className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dealsData.map((deal) => (
            <tr key={deal.id}
              className="border-b border-[var(--sidebar-border)] hover:bg-[var(--background)]"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                  <span>{deal.product}</span>
                </div>
              </td>

              <td className="px-6 py-4 text-[var(--text-secondary)] hidden sm:table-cell">
                {deal.location}
              </td>

              <td className="px-6 py-4 text-[var(--text-secondary)] hidden md:table-cell">
                {deal.date}
              </td>

              <td className="px-6 py-4 hidden lg:table-cell">
                {deal.piece}
              </td>

              <td className="px-6 py-4">{deal.amount}</td>

              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${deal.statusColor}`}>
                  {deal.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
)} */}

      </div>
    </ProtectedRoute>
  );
}
