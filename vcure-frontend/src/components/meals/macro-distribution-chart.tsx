"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MacroDistribution } from "@/types/nutrition";

const COLORS = { protein: "#059669", carbs: "#2563eb", fat: "#d97706" };

export function MacroDistributionChart({ macros }: { macros: MacroDistribution }) {
  const data = [
    { name: "Protein", value: macros.proteinG, color: COLORS.protein },
    { name: "Carbs", value: macros.carbsG, color: COLORS.carbs },
    { name: "Fat", value: macros.fatG, color: COLORS.fat }
  ];

  return (
    <div className="h-48" role="img" aria-label="Macro distribution: protein, carbs, and fat in grams">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}g`, name]}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
