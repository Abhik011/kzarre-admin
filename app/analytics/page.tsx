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

import { Users, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";

// ----------------------
// ✅ TYPES
// ----------------------
interface TrafficItem {
  _id: string;
  visits: number;
}

interface OrderDaily {
  _id: string;
  total: number;
}

interface UserTypeItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface CategorySalesItem {
  _id: string;
  total: number;
}

interface TopProductItem {
  productId: string;
  name: string;
  sold: number;
}


interface SummaryItem {
  totalOrders?: number;
  totalRevenue?: number;
  newUsers?: number;
  totalUsers?: number;
}

interface CountryTrafficItem {
  country: string;
  code: string; // ISO like IN, US, GB
  visitors: number;
}

// ----------------------
// ✅ COMPONENT
// ----------------------
const AnalyticsPage = () => {
  const [summary, setSummary] = useState<SummaryItem>({});
  const [traffic, setTraffic] = useState<TrafficItem[]>([]);
  const [ordersDaily, setOrdersDaily] = useState<OrderDaily[]>([]);
  const [userType, setUserType] = useState<UserTypeItem[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [countryTraffic, setCountryTraffic] = useState<CountryTrafficItem[]>([]);

  useEffect(() => {
    fetchSummary();
    fetchTraffic();
    fetchOrdersDaily();
    fetchUserType();
    fetchCategorySales();
    fetchTopProducts();
    fetchCountryTraffic();
  }, []);

  // ----------------------
  // ✅ FETCH FUNCTIONS
  //-----------------------

  const fetchSummary = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/summary`
    );
    const data = await res.json();
    setSummary(data.summary || {});
  };

  const fetchTraffic = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/traffic/daily`
    );
    const data = await res.json();
    setTraffic(data.traffic || []);
  };

  const fetchOrdersDaily = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/orders/daily`
    );
    const data = await res.json();
    setOrdersDaily(data.orders || []);
  };

  const fetchUserType = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/users/type`
    );
    const data = await res.json();
    setUserType([
      { name: "New Users", value: data.newUsers || 0 },
      { name: "Returning Users", value: data.returningUsers || 0 },
    ]);
  };

  const fetchCategorySales = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/category-sales`
    );
    const data = await res.json();
    setCategorySales(data.data || []);
  };

  const fetchTopProducts = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/top-products`
    );
    const data = await res.json();
    setTopProducts(data.products || []);
  };

  const fetchCountryTraffic = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/traffic/country`
    );
    const data = await res.json();

    const safeData = (data.countries || []).map((c: any) => ({
      country: c.country || "Unknown",
      code: c.code || "",
      visitors: Number(c.visitors || 0),
    }));

    setCountryTraffic(safeData);
  };


  const COLORS = ["#6DE784", "#EFBF04", "#1C64F2", "#FF6B6B", "#A855F7"];

  return (
     <div className="min-h-screen p-1 space-y-8">
      {/* HEADER */}
   
      <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl ">
        <h1 className="text-2xl font-bold text-[var(--textPrimary)]">
          Advanced Analytics
        </h1>
        <p className="text-[var(--textSecondary)] mt-1">
          Deep insights into user behavior, orders, and traffic.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Orders" icon={<ShoppingCart />} value={summary.totalOrders || 0} />

        <KPICard
          title="Revenue"
          icon={<TrendingUp />}
          value={
            summary.totalRevenue
              ? `$${summary.totalRevenue.toLocaleString()}`
              : "$0"
          }
        />

        <KPICard title="New Users" icon={<Users />} value={summary.newUsers || 0} />
        <KPICard title="Total Users" icon={<BarChart3 />} value={summary.totalUsers || 0} />
      </div>

      {/* COUNTRY WISE TRAFFIC */}
      <div className="mt-6">
        <ChartCard title="Country-wise Traffic">
          <ul className="space-y-3 " >
            {countryTraffic.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-[var(--background-card)] dark:bg-[var(--bgCard)] p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      c.code
                        ? `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`
                        : "https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png"
                    }
                    alt={c.country || "Unknown"}
                    className="w-6 h-4 rounded-sm"
                  />

                  <span className="text-[var(--textPrimary)] font-medium">
                    {c.country}
                  </span>
                </div>

                <span className=" font-bold">
                  {Number(c.visitors || 0).toLocaleString()} visits

                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      {/* DAILY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* TRAFFIC */}
        <ChartCard title="Daily Traffic (Visitors)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <CartesianGrid stroke="" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="var(--textSecondary)" />
              <YAxis stroke="var(--textSecondary)" />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#6DE784" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* USER TYPE */}
        <ChartCard title="New vs Returning Users">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userType} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {userType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ORDERS */}
        <ChartCard title="Orders Per Day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ordersDaily}>
              <CartesianGrid stroke="var(--borderColor)" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="var(--textSecondary)" />
              <YAxis stroke="var(--textSecondary)" />
              <Tooltip />
              <Bar dataKey="total" fill="#EFBF04" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CATEGORY + TOP PRODUCTS */}
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
            {topProducts.map((p, i) => (
              <li
                key={p.productId}
                className="flex justify-between bg-[var(--background-card)] dark:bg-[var(--bgCard)] p-3 rounded-lg"
              >
                <span className="text-[var(--textPrimary)] font-medium">
                  #{i + 1} {p.name}   {/* ✅ PRODUCT NAME */}
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

// ----------------------
// ✅ KPI CARD
// ----------------------
const KPICard = ({
  title,
  icon,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  value: any;
}) => (
  <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border rounded-xl p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--textSecondary)]">{title}</span>
      <span className="text-[var(--textSecondary)]">{icon}</span>
    </div>
    <h2 className="text-2xl font-bold text-[var(--textPrimary)] mt-2">
      {value}
    </h2>
  </div>
);

// ----------------------
// ✅ CHART CARD WRAPPER
// ----------------------
const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border rounded-xl p-6">
    <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">
      {title}
    </h3>
    {children}
  </div>
);

export default AnalyticsPage;
