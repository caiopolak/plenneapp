import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface TrendsChartProps {
  data: { month: string; income: number; expense: number }[];
}

const currencyFormat = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// Gerar labels e datasets a partir dos dados recebidos
function generateChartData(data: TrendsChartProps["data"]): ChartData<"line"> {
  return {
    labels: data.map((entry) => entry.month),
    datasets: [
      {
        label: "Receitas",
        data: data.map((entry) => entry.income),
        borderColor: "#2f9e44",
        backgroundColor: ctx => {
          // Gradiente verde suave para área
          const chart = ctx.chart;
          const {ctx: canvasCtx, chartArea} = chart;
          if (!chartArea) return "rgba(47, 158, 68, 0.14)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(47, 158, 68, 0.39)");
          gradient.addColorStop(1, "rgba(47,158,68,0.01)");
          return gradient;
        },
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#2f9e44",
        tension: 0.4
      },
      {
        label: "Despesas",
        data: data.map((entry) => entry.expense),
        borderColor: "#d62828",
        backgroundColor: ctx => {
          // Gradiente vermelho suave para área
          const chart = ctx.chart;
          const {ctx: canvasCtx, chartArea} = chart;
          if (!chartArea) return "rgba(214, 40, 40, 0.09)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(214, 40, 40, 0.36)");
          gradient.addColorStop(1, "rgba(214,40,40,0.01)");
          return gradient;
        },
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#d62828",
        tension: 0.4
      },
    ],
  };
}

const options: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#374151",
        font: { family: "Poppins, Inter, sans-serif", size: 15, weight: "bold" },
        boxWidth: 18,
        padding: 18,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      borderWidth: 1.5,
      titleColor: "#374151",
      bodyColor: "#1C1C1C",
      titleFont: { family: "Poppins, Inter, sans-serif", weight: "bold" },
      bodyFont: { family: "Poppins, Inter, sans-serif" },
      callbacks: {
        label: (ctx) => {
          let label = ctx.dataset.label || "";
          if (label) label += ": ";
          label += currencyFormat(ctx.parsed.y);
          return label;
        },
        title: (ctx) => `Mês: ${ctx[0].label}`,
      },
      padding: 12,
      caretSize: 7,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#64748b",
        font: { family: "Poppins, Inter, sans-serif", size: 13 },
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
        // borderDash: [2, 3], // Moved borderDash into the correct grid object
      },
      ticks: {
        color: "#64748b",
        font: { family: "Poppins, Inter, sans-serif", size: 13 },
        callback: function(value) {
          return currencyFormat(Number(value));
        }
      },
    },
  },
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  elements: {
    point: {
      radius: 6,
      borderWidth: 2,
      hoverRadius: 9,
      hoverBorderWidth: 3,
      backgroundColor: "#fff",
    },
    line: {
      borderWidth: 3,
      capBezierPoints: true,
    }
  },
  layout: {
    padding: {
      top: 18,
      left: 12,
      right: 18,
      bottom: 8,
    }
  },
  animation: {
    duration: 900,
    easing: "easeInOutQuart"
  }
};

export function TrendsChart({ data }: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        Sem dados para exibir neste período.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] px-2 py-2 rounded-2xl bg-card/80 shadow border border-border animate-fade-in">
      <Line data={generateChartData(data)} options={options} />
    </div>
  );
}
