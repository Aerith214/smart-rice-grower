import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

interface CropCycleGraphProps {
  plantingLogs: Array<{ actual_planting_date: string }>;
  harvestLogs: Array<{ actual_harvest_date: string }>;
  season: "wet" | "dry";
}

const CropCycleGraph = ({ plantingLogs, harvestLogs, season }: CropCycleGraphProps) => {
  const chartData = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const color = (name: string, a?: number) => {
      const v = root.getPropertyValue(name).trim();
      return a != null ? `hsl(${v} / ${a})` : `hsl(${v})`;
    };

    // Define standard crop cycle stages for wet and dry seasons
    const wetSeasonStages = [
      { label: "Land Prep Start", date: "2025-03-16", stage: 1 },
      { label: "Land Prep End", date: "2025-04-15", stage: 1 },
      { label: "Planting Start", date: "2025-04-01", stage: 2 },
      { label: "Planting End", date: "2025-04-30", stage: 2 },
      { label: "Growth Start", date: "2025-05-01", stage: 3 },
      { label: "Growth End", date: "2025-06-30", stage: 3 },
      { label: "Flowering Start", date: "2025-07-01", stage: 4 },
      { label: "Flowering End", date: "2025-08-08", stage: 4 },
      { label: "Harvest Start", date: "2025-08-16", stage: 5 },
      { label: "Harvest End", date: "2025-09-15", stage: 5 },
      { label: "Post-Harvest", date: "2025-09-30", stage: 6 },
    ];

    const drySeasonStages = [
      { label: "Land Prep Start", date: "2025-09-16", stage: 1 },
      { label: "Land Prep End", date: "2025-10-15", stage: 1 },
      { label: "Planting Start", date: "2025-10-01", stage: 2 },
      { label: "Planting End", date: "2025-10-30", stage: 2 },
      { label: "Growth Start", date: "2025-11-01", stage: 3 },
      { label: "Growth End", date: "2025-12-31", stage: 3 },
      { label: "Flowering Start", date: "2026-01-01", stage: 4 },
      { label: "Flowering End", date: "2026-02-08", stage: 4 },
      { label: "Harvest Start", date: "2026-02-16", stage: 5 },
      { label: "Harvest End", date: "2026-03-15", stage: 5 },
      { label: "Post-Harvest", date: "2026-03-31", stage: 6 },
    ];

    const stages = season === "wet" ? wetSeasonStages : drySeasonStages;

    // Create standard cycle line
    const standardData = stages.map(s => ({
      x: s.date,
      y: s.stage,
      label: s.label
    }));

    // Create user activity points
    const userPlantingData = plantingLogs.map(log => ({
      x: log.actual_planting_date,
      y: 2, // Planting stage
    }));

    const userHarvestData = harvestLogs.map(log => ({
      x: log.actual_harvest_date,
      y: 5, // Harvest stage
    }));

    return {
      datasets: [
        {
          label: `Standard ${season === "wet" ? "Wet" : "Dry"} Season Cycle`,
          data: standardData,
          borderColor: color("--primary"),
          backgroundColor: color("--primary", 0.1),
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
        },
        {
          label: "Your Planting Dates",
          data: userPlantingData,
          borderColor: color("--accent"),
          backgroundColor: color("--accent"),
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: "triangle",
          showLine: false,
        },
        {
          label: "Your Harvest Dates",
          data: userHarvestData,
          borderColor: color("--secondary"),
          backgroundColor: color("--secondary"),
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: "rect",
          showLine: false,
        },
      ],
    };
  }, [plantingLogs, harvestLogs, season]);

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
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const dataPoint = context.raw;
              const stageName = ["", "Land Prep", "Planting", "Growth", "Flowering", "Harvest", "Post-Harvest"][dataPoint.y || context.parsed.y];
              if (dataPoint.label) {
                return `${dataPoint.label}`;
              }
              return `${context.dataset.label}: ${stageName}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "month" as const,
            displayFormats: {
              month: "MMM yyyy",
            },
          },
          ticks: { color: color("--muted-foreground") },
          grid: { color: color("--border") },
          title: {
            display: true,
            text: "Date",
            color: color("--muted-foreground"),
          },
        },
        y: {
          min: 0,
          max: 7,
          ticks: {
            color: color("--muted-foreground"),
            callback: (value: any) => {
              const stages = ["", "Land Prep", "Planting", "Growth", "Flowering", "Harvest", "Post-Harvest"];
              return stages[value] || "";
            },
          },
          grid: { color: color("--border") },
          title: {
            display: true,
            text: "Crop Stage",
            color: color("--muted-foreground"),
          },
        },
      },
    };
  }, []);

  return (
    <div className="h-[400px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default CropCycleGraph;
