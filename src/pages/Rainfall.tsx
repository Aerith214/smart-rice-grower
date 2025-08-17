import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
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

const fullMonthNames = [
  "January",
  "February", 
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

type RainfallData = {
  month: number;
  year: number;
  rainfall_amount: number;
};

type DailyRainfallData = {
  date: string;
  rainfall_amount: number;
};

// Generate years from 2015 to present
const years = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => 2015 + i);

const RainfallPage = () => {
  useSEO({
    title: "SmartRice – Rainfall Data",
    description: "Interactive line chart of monthly rainfall by year for Bayombong.",
    canonicalPath: "/rainfall",
  });

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
  const [dailyData, setDailyData] = useState<DailyRainfallData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch daily rainfall data from Supabase
        const { data: dailyRainfall, error: dailyError } = await supabase
          .from('daily_rainfall')
          .select('*')
          .gte('date', `${year}-01-01`)
          .lt('date', `${year + 1}-01-01`)
          .order('date');

        if (dailyError) throw dailyError;

        setDailyData(dailyRainfall || []);

        // Calculate monthly totals from daily data
        const monthlyTotals = Array(12).fill(0);
        dailyRainfall?.forEach(record => {
          const month = new Date(record.date).getMonth();
          monthlyTotals[month] += record.rainfall_amount || 0;
        });

        setMonthlyData(monthlyTotals);
      } catch (e: any) {
        setError(e.message);
        console.error('Error loading rainfall data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
          data: monthlyData,
          borderColor: color("--primary"),
          backgroundColor: color("--primary", 0.15),
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [monthlyData, year]);

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
          data: monthlyData,
          backgroundColor: color("--primary", 0.8),
          borderColor: color("--primary"),
          borderWidth: 1,
        },
      ],
    };
  }, [monthlyData, year]);

  const dailyChartData = useMemo(() => {
    if (selectedMonth === null) return null;
    
    const root = getComputedStyle(document.documentElement);
    const color = (name: string, a?: number) => {
      const v = root.getPropertyValue(name).trim();
      return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`;
    };
    
    // Filter daily data for selected month
    const monthlyDailyData = dailyData.filter(record => {
      const date = new Date(record.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === year;
    });
    
    // Sort by date
    monthlyDailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dayLabels = monthlyDailyData.map(record => {
      const date = new Date(record.date);
      return `${date.getDate()}`;
    });
    
    const dailyAmounts = monthlyDailyData.map(record => record.rainfall_amount);
    
    return {
      labels: dayLabels,
      datasets: [
        {
          label: `Daily Rainfall - ${fullMonthNames[selectedMonth]} ${year}`,
          data: dailyAmounts,
          borderColor: color("--accent"),
          backgroundColor: color("--accent", 0.15),
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [selectedMonth, dailyData, year]);

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
        <div className="flex gap-4">
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
          <div>
            <label htmlFor="month" className="mr-3 text-sm text-muted-foreground">
              Select month
            </label>
            <select
              id="month"
              className="rounded-md border bg-background px-3 py-2"
              value={selectedMonth ?? ""}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Months</option>
              {fullMonthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
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

      {selectedMonth !== null && dailyChartData && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Rainfall - {fullMonthNames[selectedMonth]} {year}</CardTitle>
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
                <Line data={dailyChartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default RainfallPage;
