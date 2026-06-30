import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Store,
  Users,
  MapPin,
  Package,
  Truck,
  Loader2,
  RefreshCw,
} from "lucide-react";

/* ----------------------------- Types ----------------------------- */

type SellerComplaint = {
  id: string;
  issues: string[];
  products: string[];
  distributor: string;
  duration: string;
  details: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: {
    storeName: string;
    phoneNumber: string;
    state: string;
    county: string;
    town: string;
    platform: string;
  };
};

type ConsumerComplaint = {
  id: string;
  companyName: string;
  companyProduct: string;
  state: string;
  county: string;
  town: string;
  details: string;
  name: string;
  phoneNumber: string;
  email: string;
  imageUrl: string | null;
  createdAt: string;
};

type RangeOption = 7 | 30 | 90 | "all";

type Count = { name: string; value: number };
type TrendPoint = { name: string; value: number; sortKey: number };
type CombinedTrendPoint = {
  name: string;
  seller: number;
  consumer: number;
  sortKey: number;
};

/* ----------------------------- Helpers ----------------------------- */

const COLORS = {
  red: "#c0362c",
  redLight: "#e07a6f",
  ink: "#1f1b16",
  inkSoft: "#6b6358",
  paper: "#faf8f5",
  line: "#e4ded3",
  amber: "#c98a2c",
  teal: "#3d6b62",
};

const PIE_PALETTE = [
  COLORS.red,
  COLORS.amber,
  COLORS.teal,
  COLORS.redLight,
  "#8c7a5c",
  "#9b9186",
];

function countBy<T>(
  arr: T[],
  getKey: (item: T) => string | string[] | null | undefined,
): Count[] {
  const map = new Map<string, number>();
  arr.forEach((item) => {
    const raw = getKey(item);
    const keys = Array.isArray(raw) ? raw : [raw];
    keys.forEach((k) => {
      if (!k) return;
      map.set(k, (map.get(k) || 0) + 1);
    });
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function countByMonth(arr: { createdAt: string }[]): TrendPoint[] {
  const map = new Map<string, TrendPoint>();
  arr.forEach((item) => {
    const d = new Date(item.createdAt);
    if (isNaN(d.getTime())) return;
    const key = `${d.toLocaleString("en-US", { month: "short" })} '${String(
      d.getFullYear(),
    ).slice(2)}`;
    const sortKey = d.getFullYear() * 100 + d.getMonth();
    const existing = map.get(key);
    map.set(key, { name: key, value: (existing?.value || 0) + 1, sortKey });
  });
  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

function withinDays(dateStr: string, days: RangeOption): boolean {
  if (days === "all") return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

/* ----------------------------- UI atoms ----------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border p-4"
      style={{ borderColor: COLORS.line, background: "#fff" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
        style={{ background: accent + "1a", color: accent }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div
          className="truncate text-2xl font-semibold tracking-tight"
          style={{ color: COLORS.ink }}
          title={String(value)}
        >
          {value}
        </div>
        <div
          className="text-xs uppercase tracking-wide"
          style={{ color: COLORS.inkSoft }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  span = 1,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${span === 2 ? "md:col-span-2" : ""}`}
      style={{ borderColor: COLORS.line, background: "#fff" }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: COLORS.ink }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs" style={{ color: COLORS.inkSoft }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-md border px-3 py-2 text-xs shadow-sm"
      style={{
        background: "#fff",
        borderColor: COLORS.line,
        color: COLORS.ink,
      }}
    >
      <div className="font-medium">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || COLORS.red }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: COLORS.red + "12", color: COLORS.red }}
    >
      {children}
    </span>
  );
}

function RecentList<T extends { id: string }>({
  title,
  items,
  render,
}: {
  title: string;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: COLORS.line, background: "#fff" }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: COLORS.ink }}>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-md border px-3 py-2.5 transition-colors hover:bg-black/2"
            style={{ borderColor: COLORS.line }}
          >
            {render(item)}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm" style={{ color: COLORS.inkSoft }}>
            No complaints in this range.
          </p>
        )}
      </div>
    </div>
  );
}

const RANGE_OPTIONS: { label: string; value: RangeOption }[] = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All", value: "all" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "seller", label: "Seller Complaints" },
  { id: "consumer", label: "Consumer Complaints" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ----------------------------- Main component ----------------------------- */

export default function ComplaintsAnalyticsDashboard() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<RangeOption>(30);

  const [sellerComplaintsRaw, setSellerComplaintsRaw] = useState<
    SellerComplaint[]
  >([]);
  const [consumerComplaintsRaw, setConsumerComplaintsRaw] = useState<
    ConsumerComplaint[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sellerRes, consumerRes] = await Promise.all([
        axios.get(`${apiUrl}/api/auth/admin/seller/complaints`, {
          withCredentials: true,
        }),
        axios.get(`${apiUrl}/api/auth/admin/consumer/complaints`, {
          withCredentials: true,
        }),
      ]);

      setSellerComplaintsRaw(sellerRes.data.complaints || []);
      setConsumerComplaintsRaw(consumerRes.data.complaints || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(
        "Couldn't load complaints. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const sellerComplaints = useMemo(
    () => sellerComplaintsRaw.filter((c) => withinDays(c.createdAt, range)),
    [sellerComplaintsRaw, range],
  );
  const consumerComplaints = useMemo(
    () => consumerComplaintsRaw.filter((c) => withinDays(c.createdAt, range)),
    [consumerComplaintsRaw, range],
  );

  // Seller-side aggregates
  const sellerByState = useMemo(
    () => countBy(sellerComplaints, (c) => c.user.state),
    [sellerComplaints],
  );
  const sellerByIssue = useMemo(
    () => countBy(sellerComplaints, (c) => c.issues),
    [sellerComplaints],
  );

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Reset the issue filter if it disappears from the current range/data
  useEffect(() => {
    if (selectedIssue && !sellerByIssue.some((i) => i.name === selectedIssue)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIssue(null);
    }
  }, [sellerByIssue, selectedIssue]);

  const sellerByProduct = useMemo(() => {
    const source = selectedIssue
      ? sellerComplaints.filter((c) => c.issues.includes(selectedIssue))
      : sellerComplaints;
    return countBy(source, (c) => c.products);
  }, [sellerComplaints, selectedIssue]);
  const sellerByPlatform = useMemo(
    () => countBy(sellerComplaints, (c) => c.user.platform),
    [sellerComplaints],
  );
  const sellerByDistributor = useMemo(
    () => countBy(sellerComplaints, (c) => c.distributor),
    [sellerComplaints],
  );
  const sellerTrend = useMemo(
    () => countByMonth(sellerComplaints),
    [sellerComplaints],
  );

  // Consumer-side aggregates
  const consumerByState = useMemo(
    () => countBy(consumerComplaints, (c) => c.state),
    [consumerComplaints],
  );
  const consumerByCompany = useMemo(
    () => countBy(consumerComplaints, (c) => c.companyName).slice(0, 8),
    [consumerComplaints],
  );

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Reset the company filter if it disappears from the current range/data
  useEffect(() => {
    if (
      selectedCompany &&
      !consumerByCompany.some((c) => c.name === selectedCompany)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCompany(null);
    }
  }, [consumerByCompany, selectedCompany]);

  const consumerByProduct = useMemo(() => {
    const source = selectedCompany
      ? consumerComplaints.filter((c) => c.companyName === selectedCompany)
      : consumerComplaints;
    return countBy(source, (c) => c.companyProduct);
  }, [consumerComplaints, selectedCompany]);
  const consumerTrend = useMemo(
    () => countByMonth(consumerComplaints),
    [consumerComplaints],
  );

  // Combined trend (overview)
  const combinedTrend = useMemo(() => {
    const map = new Map<string, CombinedTrendPoint>();
    sellerTrend.forEach((d) =>
      map.set(d.name, {
        name: d.name,
        seller: d.value,
        consumer: 0,
        sortKey: d.sortKey,
      }),
    );
    consumerTrend.forEach((d) => {
      const existing = map.get(d.name);
      if (existing) existing.consumer = d.value;
      else
        map.set(d.name, {
          name: d.name,
          seller: 0,
          consumer: d.value,
          sortKey: d.sortKey,
        });
    });
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [sellerTrend, consumerTrend]);

  const totalComplaints = sellerComplaints.length + consumerComplaints.length;

  const topState = useMemo(() => {
    const combined = [
      ...sellerComplaints.map((c) => c.user.state),
      ...consumerComplaints.map((c) => c.state),
    ];
    return countBy(combined, (s) => s)[0];
  }, [sellerComplaints, consumerComplaints]);

  /* ----------------------------- Render ----------------------------- */

  if (loading) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
        style={{ background: COLORS.paper }}
      >
        <Loader2
          className="animate-spin"
          size={40}
          style={{ color: COLORS.red }}
        />
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>
          Loading complaints…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ background: COLORS.paper }}
      >
        <AlertTriangle size={36} style={{ color: COLORS.red }} />
        <p className="font-medium" style={{ color: COLORS.ink }}>
          {error}
        </p>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ background: COLORS.red }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: COLORS.paper }}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Header */}
        <div
          className="mb-6 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between"
          style={{ borderColor: COLORS.line }}
        >
          <div>
            <div
              className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest"
              style={{ color: COLORS.red }}
            >
              <AlertTriangle size={14} />
              Trust &amp; Safety
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight md:text-3xl"
              style={{ color: COLORS.ink }}
            >
              Complaints Analytics
            </h1>
            <p className="mt-1 text-sm" style={{ color: COLORS.inkSoft }}>
              Seller and consumer complaint activity across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-md border p-1"
              style={{ borderColor: COLORS.line, background: "#fff" }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setRange(opt.value)}
                  className="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background:
                      range === opt.value ? COLORS.red : "transparent",
                    color: range === opt.value ? "#fff" : COLORS.inkSoft,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAll}
              title="Refresh data"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border"
              style={{
                borderColor: COLORS.line,
                background: "#fff",
                color: COLORS.inkSoft,
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="mb-6 flex gap-6 border-b"
          style={{ borderColor: COLORS.line }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative cursor-pointer pb-3 text-sm font-medium transition-colors"
              style={{ color: tab === t.id ? COLORS.ink : COLORS.inkSoft }}
            >
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: COLORS.red }}
                />
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={AlertTriangle}
                label="Total Complaints"
                value={totalComplaints}
                accent={COLORS.red}
              />
              <StatCard
                icon={Store}
                label="Seller Complaints"
                value={sellerComplaints.length}
                accent={COLORS.amber}
              />
              <StatCard
                icon={Users}
                label="Consumer Complaints"
                value={consumerComplaints.length}
                accent={COLORS.teal}
              />
              <StatCard
                icon={MapPin}
                label="Top Location"
                value={topState ? topState.name : "—"}
                accent={COLORS.redLight}
              />
            </div>

            <ChartCard
              title="Complaints over time"
              subtitle="Seller vs. consumer, by month"
              span={2}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={combinedTrend}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={{ stroke: COLORS.line }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="seller"
                    name="Seller"
                    stroke={COLORS.amber}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumer"
                    name="Consumer"
                    stroke={COLORS.teal}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartCard title="Seller complaints by state">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={sellerByState}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid stroke={COLORS.line} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: COLORS.ink }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Complaints"
                      fill={COLORS.amber}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Consumer complaints by state">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={consumerByState}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid stroke={COLORS.line} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: COLORS.ink }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Complaints"
                      fill={COLORS.teal}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}

        {/* SELLER TAB */}
        {tab === "seller" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Store}
                label="Total"
                value={sellerComplaints.length}
                accent={COLORS.red}
              />
              <StatCard
                icon={Truck}
                label="Top Distributor"
                value={sellerByDistributor[0]?.name || "—"}
                accent={COLORS.amber}
              />
              <StatCard
                icon={AlertTriangle}
                label="Top Issue"
                value={sellerByIssue[0]?.name || "—"}
                accent={COLORS.redLight}
              />
              <StatCard
                icon={MapPin}
                label="Top State"
                value={sellerByState[0]?.name || "—"}
                accent={COLORS.teal}
              />
            </div>

            <ChartCard
              title="Seller complaints trend"
              subtitle="Monthly volume"
              span={2}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sellerTrend}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={{ stroke: COLORS.line }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Complaints"
                    fill={COLORS.red}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartCard
                title="By issue type"
                subtitle="Click a slice to see that issue's product breakdown"
              >
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={sellerByIssue}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }: any) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                      style={{ fontSize: 11 }}
                      cursor="pointer"
                      onClick={(data: any) => {
                        const name = data?.name as string | undefined;
                        if (!name) return;
                        setSelectedIssue((prev) =>
                          prev === name ? null : name,
                        );
                      }}
                    >
                      {sellerByIssue.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={PIE_PALETTE[i % PIE_PALETTE.length]}
                          fillOpacity={
                            selectedIssue && selectedIssue !== entry.name
                              ? 0.35
                              : 1
                          }
                          stroke={
                            selectedIssue === entry.name
                              ? COLORS.ink
                              : undefined
                          }
                          strokeWidth={
                            selectedIssue === entry.name ? 2 : undefined
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={
                  selectedIssue
                    ? `Products — ${selectedIssue}`
                    : "By product category"
                }
                subtitle={
                  selectedIssue ? (
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="font-medium cursor-pointer underline underline-offset-2"
                      style={{ color: COLORS.red }}
                    >
                      Clear filter, show all issues
                    </button>
                  ) : (
                    "All issues combined"
                  )
                }
              >
                {sellerByProduct.length === 0 ? (
                  <div
                    className="flex h-65 items-center justify-center text-sm"
                    style={{ color: COLORS.inkSoft }}
                  >
                    No products to show for this selection.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={sellerByProduct}>
                      <CartesianGrid stroke={COLORS.line} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: COLORS.inkSoft }}
                        axisLine={{ stroke: COLORS.line }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Complaints"
                        fill={COLORS.amber}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="By platform">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={sellerByPlatform}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid stroke={COLORS.line} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: COLORS.ink }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Complaints"
                      fill={COLORS.teal}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="By distributor">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={sellerByDistributor}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid stroke={COLORS.line} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: COLORS.ink }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Complaints"
                      fill={COLORS.redLight}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <RecentList
              title="Recent seller complaints"
              items={sellerComplaints.slice(0, 6)}
              render={(c) => (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: COLORS.ink }}>
                      {c.user.storeName}
                    </span>
                    <span className="text-xs" style={{ color: COLORS.inkSoft }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.issues.map((issue, i) => (
                      <Tag key={i}>{issue}</Tag>
                    ))}
                  </div>
                  <div
                    className="mt-1 text-xs"
                    style={{ color: COLORS.inkSoft }}
                  >
                    {c.user.town}, {c.user.state} · {c.user.platform} · via{" "}
                    {c.distributor}
                  </div>
                </>
              )}
            />
          </div>
        )}

        {/* CONSUMER TAB */}
        {tab === "consumer" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total"
                value={consumerComplaints.length}
                accent={COLORS.red}
              />
              <StatCard
                icon={Package}
                label="Top Product"
                value={consumerByProduct[0]?.name || "—"}
                accent={COLORS.amber}
              />
              <StatCard
                icon={Store}
                label="Most Reported Company"
                value={consumerByCompany[0]?.name || "—"}
                accent={COLORS.redLight}
              />
              <StatCard
                icon={MapPin}
                label="Top State"
                value={consumerByState[0]?.name || "—"}
                accent={COLORS.teal}
              />
            </div>

            <ChartCard
              title="Consumer complaints trend"
              subtitle="Monthly volume"
              span={2}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={consumerTrend}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={{ stroke: COLORS.line }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Complaints"
                    fill={COLORS.teal}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartCard
                title="Most-reported companies"
                subtitle="Click a bar to see that company's product breakdown"
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={consumerByCompany}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid stroke={COLORS.line} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: COLORS.inkSoft }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11, fill: COLORS.ink }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Complaints"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(data: any) => {
                        const name = data?.name as string | undefined;
                        if (!name) return;
                        setSelectedCompany((prev) =>
                          prev === name ? null : name,
                        );
                      }}
                    >
                      {consumerByCompany.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            selectedCompany === entry.name
                              ? COLORS.ink
                              : COLORS.red
                          }
                          fillOpacity={
                            selectedCompany && selectedCompany !== entry.name
                              ? 0.35
                              : 1
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={
                  selectedCompany
                    ? `Products — ${selectedCompany}`
                    : "By product category"
                }
                subtitle={
                  selectedCompany ? (
                    <button
                      onClick={() => setSelectedCompany(null)}
                      className="font-medium cursor-pointer underline underline-offset-2"
                      style={{ color: COLORS.red }}
                    >
                      Clear filter, show all companies
                    </button>
                  ) : (
                    "All companies combined"
                  )
                }
              >
                {consumerByProduct.length === 0 ? (
                  <div
                    className="flex h-65 items-center justify-center text-sm"
                    style={{ color: COLORS.inkSoft }}
                  >
                    No products to show for this selection.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={consumerByProduct}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }: any) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                        style={{ fontSize: 11 }}
                      >
                        {consumerByProduct.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_PALETTE[i % PIE_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <RecentList
              title="Recent consumer complaints"
              items={consumerComplaints.slice(0, 6)}
              render={(c) => (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: COLORS.ink }}>
                      {c.name}
                    </span>
                    <span className="text-xs" style={{ color: COLORS.inkSoft }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Tag>{c.companyName}</Tag>
                    <Tag>{c.companyProduct}</Tag>
                  </div>
                  <div
                    className="mt-1 text-xs"
                    style={{ color: COLORS.inkSoft }}
                  >
                    {c.town}, {c.state}
                  </div>
                </>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
