"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Users,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Globe,
  Package,
} from "lucide-react";

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<any>({});
  const [traffic, setTraffic] = useState([]);
  const [ordersDaily, setOrdersDaily] = useState([]);
const [userType, setUserType] = useState<{ name: string; value: number }[]>([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Fetch everything on load
  useEffect(() => {
    fetchSummary();
    fetchTraffic();
    fetchOrdersDaily();
    fetchUserType();
    fetchCategorySales();
    fetchTopProducts();
  }, []);

  const fetchSummary = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/summary`);
    const data = await res.json();
    setSummary(data.summary);
  };

  const fetchTraffic = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/traffic/daily`);
    const data = await res.json();
    setTraffic(data.traffic || []);
  };

  const fetchOrdersDaily = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/orders/daily`);
    const data = await res.json();
    setOrdersDaily(data.orders || []);
  };

 const fetchUserType = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/users/type`);
  const data = await res.json();
  setUserType([
    { name: "New Users", value: data.newUsers },
    { name: "Returning Users", value: data.returningUsers },
  ]);
};

  const fetchCategorySales = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/category-sales`);
    const data = await res.json();
    setCategorySales(data.data || []);
  };

  const fetchTopProducts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/top-products`);
    const data = await res.json();
    setTopProducts(data.products || []);
  };

  const COLORS = ["#6DE784", "#D2BD50", "#1C64F2", "#FF6B6B", "#A855F7"];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--textPrimary)]">
          Advanced Analytics
        </h1>
        <p className="text-[var(--textSecondary)] mt-1">
          Deep insights into user behavior, orders, and traffic.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Orders" icon={<ShoppingCart />} value={summary.totalOrders} />
        <KPICard title="Revenue" icon={<TrendingUp />} value={`$${summary.totalRevenue}`} />
        <KPICard title="New Users" icon={<Users />} value={summary.newUsers} />
        <KPICard title="Total Users" icon={<BarChart3 />} value={summary.totalUsers} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Traffic */}
        <ChartCard title="Daily Traffic (Visitors)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <CartesianGrid stroke="var(--borderColor)" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="var(--textSecondary)" />
              <YAxis stroke="var(--textSecondary)" />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#6DE784" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Breakdown */}
        <ChartCard title="New vs Returning Users">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userType} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {userType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orders */}
        <ChartCard title="Orders Per Day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ordersDaily}>
              <CartesianGrid stroke="var(--borderColor)" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="var(--textSecondary)" />
              <YAxis stroke="var(--textSecondary)" />
              <Tooltip />
              <Bar dataKey="total" fill="#D2BD50" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CATEGORY SALES + TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <ChartCard title="Sales by Category">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categorySales}>
              <XAxis dataKey="_id" stroke="var(--textSecondary)" />
              <YAxis stroke="var(--textSecondary)" />
              <Tooltip />
              <Bar dataKey="total" fill="#1C64F2" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Selling Products">
          <ul className="space-y-3">
            {topProducts.map((p: any, i) => (
              <li
                key={p._id}
                className="flex justify-between bg-[var(--background-card)] dark:bg-[var(--bgCard)] p-3 rounded-lg"
              >
                <span className="text-[var(--textPrimary)] font-medium">
                  #{i + 1} {p._id}
                </span>
                <span className="text-[var(--accent-green)] font-bold">
                  {p.sold} sold
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, icon, value }: any) => (
  <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] rounded-xl p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--textSecondary)]">{title}</span>
      <span className="text-[var(--textSecondary)]">{icon}</span>
    </div>
    <h2 className="text-2xl font-bold text-[var(--textPrimary)] mt-2">{value}</h2>
  </div>
);

// Chart card
const ChartCard = ({ title, children }: any) => (
  <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] rounded-xl p-6">
    <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">
      {title}
    </h3>
    {children}
  </div>
);

export default AnalyticsPage;
