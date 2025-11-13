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
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ import your existing guard

// === dummy data ===
const trafficData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 500 },
  { name: "Wed", value: 550 },
  { name: "Thu", value: 700 },
  { name: "Fri", value: 900 },
  { name: "Sat", value: 1200 },
  { name: "Sun", value: 1800 },
];

const usersData = [
  { name: "Mon", New: 70, Returning: 90 },
  { name: "Tue", New: 40, Returning: 60 },
  { name: "Wed", New: 80, Returning: 30 },
  { name: "Thu", New: 30, Returning: 40 },
  { name: "Fri", New: 20, Returning: 75 },
  { name: "Sat", New: 75, Returning: 25 },
  { name: "Sun", New: 55, Returning: 95 },
];

const dealsData = [
  {
    id: 1,
    product: "Apple Watch",
    location: "6096 Marjolaine Landing",
    date: "12.09.2019 - 12:53 PM",
    piece: 423,
    amount: "$34,295",
    status: "Delivered",
    statusColor: "bg-teal-100 text-teal-800",
  },
  {
    id: 2,
    product: "Apple Watch",
    location: "6096 Marjolaine Landing",
    date: "12.09.2019 - 12:53 PM",
    piece: 423,
    amount: "$34,295",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: 3,
    product: "Apple Watch",
    location: "6096 Marjolaine Landing",
    date: "12.09.2019 - 12:53 PM",
    piece: 423,
    amount: "$34,295",
    status: "Rejected",
    statusColor: "bg-red-100 text-red-800",
  },
];

// === stat card ===
const StatCard = ({ title, value, change, icon: Icon, isPositive, bgColor }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border-l-4 border-blue-400 shadow-sm">
    <div className="flex items-start justify-between gap-3 sm:gap-0">
      <div className="flex-1">
        <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
        <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        <p
          className={`text-xs sm:text-sm mt-2 flex items-center gap-1 ${
            isPositive ? "text-teal-600" : "text-red-600"
          }`}
        >
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </p>
      </div>
      <div className={`p-2 sm:p-4 rounded-lg flex-shrink-0 ${bgColor}`}>
        <Icon size={24} className="text-gray-600 sm:w-8 sm:h-8" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
 const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  // === Role-based visibility ===
  const canViewSales = role === "superadmin";
  const canViewDeals = role === "superadmin";
  const canViewUsers = role === "superadmin" || role === "admin";

  return (
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="sm:pb-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-sm text-gray-600">Role: {role}</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Users"
              value="11,250"
              change="8.5% Up from yesterday"
              icon={Users}
              isPositive={true}
              bgColor="bg-blue-100"
            />

            {canViewUsers && (
              <StatCard
                title="Total Orders"
                value="1,250"
                change="8.5% Up from yesterday"
                icon={ShoppingCart}
                isPositive={true}
                bgColor="bg-yellow-100"
              />
            )}

            {canViewSales && (
              <StatCard
                title="Total Sales"
                value="$1,250"
                change="1.5% Up from yesterday"
                icon={TrendingUp}
                isPositive={true}
                bgColor="bg-green-100"
              />
            )}

            <StatCard
              title="Total Pending"
              value="$1,250"
              change="1.5% Down from yesterday"
              icon={Clock}
              isPositive={false}
              bgColor="bg-orange-100"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Always visible */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                Website Traffic
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6d5bf3c5"
                    fill="#8979FF"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {canViewUsers && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                  New vs Returning Users
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="New" fill="#a78bfa" />
                    <Bar dataKey="Returning" fill="#fb7185" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Deals Table (SuperAdmin Only) */}
          {canViewDeals && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Deals Details</h3>
                <button className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  October ▼
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Product Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Location
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Date - Time
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Piece
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealsData.map((deal) => (
                      <tr
                        key={deal.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg flex-shrink-0"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {deal.product}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {deal.location}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                          {deal.date}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 font-medium hidden lg:table-cell">
                          {deal.piece}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 font-medium">
                          {deal.amount}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${deal.statusColor}`}
                          >
                            {deal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
