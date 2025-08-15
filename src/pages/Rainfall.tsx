import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type RainfallResponse = {
  year: number;
  monthly_mm: number[]; // 12 values
};

const years = [2023, 2024];

const RainfallPage = () => {
  useSEO({
    title: "SmartRice – Rainfall Data",
    description: "Interactive line chart of monthly rainfall by year for Bayombong.",
    canonicalPath: "/rainfall",
  });

  const [year, setYear] = useState<number>(2024);
  const [data, setData] = useState<RainfallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/data/rainfall-${year}.json`);
        if (!res.ok) throw new Error("Failed to load rainfall data");
        const json = (await res.json()) as RainfallResponse;
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  const lineChartData = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const color = (name: string, a?: number) => {
      const v = root.getPropertyValue(name).trim();
      return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`;
    };
    return {
      labels: monthLabels,
      datasets: [
        {
          label: `Rainfall (${year})`,
          data: data?.monthly_mm ?? Array(12).fill(0),
          borderColor: color("--primary"),
          backgroundColor: color("--primary", 0.15),
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [data, year]);

  const barChartData = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const color = (name: string, a?: number) => {
      const v = root.getPropertyValue(name).trim();
      return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`;
    };
    return {
      labels: monthLabels,
      datasets: [
        {
          label: `Monthly Total (${year})`,
          data: data?.monthly_mm ?? Array(12).fill(0),
          backgroundColor: color("--primary", 0.8),
          borderColor: color("--primary"),
          borderWidth: 1,
        },
      ],
    };
  }, [data, year]);

  const chartOptions = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const color = (name: string, a?: number) => {
      const v = root.getPropertyValue(name).trim();
      return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`;
    };
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: color("--foreground") },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
        },
      },
      scales: {
        x: {
          ticks: { color: color("--muted-foreground") },
          grid: { color: color("--border") },
        },
        y: {
          ticks: { color: color("--muted-foreground") },
          grid: { color: color("--border") },
          title: { display: true, text: "mm", color: color("--muted-foreground") },
        },
      },
    } as const;
  }, []);

  return (
    <main className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Rainfall Data</h1>
        <div>
          <label htmlFor="year" className="mr-3 text-sm text-muted-foreground">
            Select year
          </label>
          <select
            id="year"
            className="rounded-md border bg-background px-3 py-2"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Rainfall Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Loading chart…</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!loading && !error && (
              <div className="h-[360px]">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Rainfall Totals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Loading chart…</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!loading && !error && (
              <div className="h-[360px]">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default RainfallPage;
