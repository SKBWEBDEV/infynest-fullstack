// File Path: src/components/admin/OrderStatusChart.jsx

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_CONFIG = {
  Pending: {
    color: "#F59E0B",
  },
  Confirmed: {
    color: "#06B6D4",
  },
  Processing: {
    color: "#6366F1",
  },
  Shipped: {
    color: "#3B82F6",
  },
  Delivered: {
    color: "#22C55E",
  },
  Cancelled: {
    color: "#EF4444",
  },
};

const OrderStatusChart = ({ orders = [] }) => {
  const statusData = useMemo(() => {
    const counts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const rawStatus = order?.orderStatus || "Pending";

      const status =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        counts.Pending++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_CONFIG[name].color,
    }));
  }, [orders]);

  const totalOrders = orders.length;

  return (
    <div className="bg-[#161920] border border-gray-800 rounded-2xl p-5 md:p-6 shadow-lg">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm md:text-base font-black text-white">
            Order Status
          </h3>

          <p className="text-[11px] text-gray-500 mt-1">
            Current order distribution
          </p>
        </div>

        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
      </div>

      {/* CHART */}
      <div className="relative w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="82%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {statusData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f1115",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
              itemStyle={{
                color: "#fff",
              }}
              formatter={(value, name) => [
                `${value} order${value !== 1 ? "s" : ""}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* CENTER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            Total Orders
          </span>

          <span className="text-3xl font-black text-white mt-1">
            {totalOrders}
          </span>
        </div>
      </div>

      {/* LEGEND */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4">
        {statusData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}80`,
                }}
              />

              <span className="text-[11px] text-gray-400 truncate">
                {item.name}
              </span>
            </div>

            <span className="text-[11px] font-bold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;
