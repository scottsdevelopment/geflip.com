"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useTimeseriesStore } from "@/stores/useTimeseriesStore";
import { useItemsStore } from "@/stores/useItemsStore";
import { PriceData, TimeSeriesData } from "@/lib/types";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface ItemChartsProps {
    itemId: number;
    latestPrice: PriceData | null;
}

export default function ItemCharts({ itemId, latestPrice }: ItemChartsProps) {
    const [timeRange, setTimeRange] = useState("1d");
    const [data, setData] = useState<TimeSeriesData[]>([]);
    const getTimeseries = useTimeseriesStore((state) => state.getTimeseries);
    const invalidateCache = useTimeseriesStore((state) => state.invalidateCache);
    const lastUpdated = useItemsStore((state) => state.lastUpdated);

    useEffect(() => {
        const loadData = async () => {
            let timestep = "5m";
            if (timeRange === "7d") timestep = "1h";
            if (timeRange === "30d") timestep = "6h";
            if (timeRange === "1y") timestep = "24h";

            // Invalidate cache before fetching to force fresh data
            if (lastUpdated) {
                invalidateCache(itemId);
            }

            const timeSeries = await getTimeseries(itemId, timestep);

            // Filter based on range
            const now = Math.floor(Date.now() / 1000);
            let startTime = now;
            if (timeRange === "1d") startTime = now - 24 * 60 * 60;
            else if (timeRange === "7d") startTime = now - 7 * 24 * 60 * 60;
            else if (timeRange === "30d") startTime = now - 30 * 24 * 60 * 60;
            else if (timeRange === "1y") startTime = now - 365 * 24 * 60 * 60;

            const filtered = timeSeries.filter((d) => (d.timestamp || 0) >= startTime);

            // Append latest data point if available
            if (latestPrice && latestPrice.high > 0 && latestPrice.low > 0) {
                filtered.push({
                    timestamp: now,
                    avgHighPrice: latestPrice.high,
                    avgLowPrice: latestPrice.low,
                    highPriceVolume: 0,
                    lowPriceVolume: 0,
                });
            }

            setData(filtered);
        };

        loadData();
    }, [itemId, timeRange, getTimeseries, lastUpdated, invalidateCache, latestPrice]);

    const labels = data.map((d) => (d.timestamp || 0) * 1000);

    const priceData = {
        labels,
        datasets: [
            {
                label: "Avg Sell Price",
                data: data.map((d) => d.avgHighPrice),
                borderColor: "#936039",
                backgroundColor: "rgba(147, 96, 57, 0.1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                spanGaps: true,
            },
            {
                label: "Avg Buy Price",
                data: data.map((d) => d.avgLowPrice),
                borderColor: "#5a3820",
                backgroundColor: "rgba(90, 56, 32, 0.1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                spanGaps: true,
            },
        ],
    };

    const volumeData = {
        labels,
        datasets: [
            {
                label: "Sell Volume",
                data: data.map((d) => d.highPriceVolume),
                backgroundColor: "#936039",
            },
            {
                label: "Buy Volume",
                data: data.map((d) => d.lowPriceVolume),
                backgroundColor: "#5a3820",
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                labels: { color: "#000" },
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    tooltipFormat: "PPpp",
                    displayFormats: {
                        hour: "MMM d, h:mm a",
                        day: "MMM d",
                    },
                },
                grid: { color: "#94866d" },
                ticks: { color: "#000" },
            },
            y: {
                grid: { color: "#94866d" },
                ticks: { color: "#000" },
            },
        },
    };

    return (
        <div className="mt-8">
            <div className="flex justify-end mb-4">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 bg-osrs-button text-black border border-osrs-border rounded cursor-pointer hover:bg-osrs-button-hover transition-colors font-bold"
                >
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>

            <h3 className="m-0 mb-2 text-osrs-accent text-center font-header font-bold text-xl">Price History</h3>
            <div className="bg-osrs-input p-4 rounded-lg border border-osrs-border mb-8 h-[400px]">
                <Line data={priceData} options={options} />
            </div>

            <h3 className="m-0 mb-2 text-osrs-accent text-center font-header font-bold text-xl">Volume History</h3>
            <div className="bg-osrs-input p-4 rounded-lg border border-osrs-border mb-8 h-[400px]">
                <Bar data={volumeData} options={options} />
            </div>
        </div>
    );
}
