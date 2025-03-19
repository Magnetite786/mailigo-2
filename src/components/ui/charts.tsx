import React, { ReactNode } from "react";

// These are simple chart component placeholders
// In a real app, you would use a library like recharts, chart.js, or tremor

interface ChartContainerProps {
  children: ReactNode;
}

export function ChartContainer({ children }: ChartContainerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
}

interface ChartProps {
  data: any[];
  categories?: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showAnimation?: boolean;
}

export function LineChart({
  data,
  categories = [],
  index = "index",
  colors = ["blue", "green", "amber", "purple"],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showAnimation = false,
}: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  // This is a very basic visualization - in a real app you'd use a proper charting library
  const maxValue = Math.max(
    ...data.flatMap((item) =>
      categories.map((cat) => (typeof item[cat] === "number" ? item[cat] : 0))
    )
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {data.map((item, i) => (
            <div key={i} className="text-xs text-gray-500">
              {item[index]}
            </div>
          ))}
        </div>

        {/* Chart content - simplified version */}
        <div className="absolute top-4 bottom-6 left-0 right-0 flex items-end">
          {data.map((item, i) => (
            <div key={i} className="flex-1 h-full flex items-end justify-center gap-1">
              {categories.map((cat, catIndex) => {
                const value = item[cat] || 0;
                const height = maxValue ? (value / maxValue) * 100 : 0;
                
                return (
                  <div
                    key={cat}
                    className={`w-2 bg-${colors[catIndex % colors.length]}-500 rounded-t`}
                    style={{ 
                      height: `${height}%`,
                      opacity: 0.7,
                    }}
                    title={`${cat}: ${valueFormatter(value)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center gap-4 mt-2">
          {categories.map((cat, i) => (
            <div key={cat} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full bg-${colors[i % colors.length]}-500 mr-1`} />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  data,
  categories = [],
  index = "index",
  colors = ["blue", "green", "amber"],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
}: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  return (
    <div className="w-full h-full">
      <LineChart
        data={data}
        categories={categories}
        index={index}
        colors={colors}
        valueFormatter={valueFormatter}
        showLegend={showLegend}
      />
    </div>
  );
}

export function PieChart({
  data,
  category = "value",
  index = "name",
  colors = ["blue", "green", "amber", "purple", "red"],
  valueFormatter = (value) => `${value}`,
}: {
  data: any[];
  category?: string;
  index?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-40 h-40">
          {data.map((item, i) => {
            const value = item[category] || 0;
            const percentage = total ? (value / total) * 100 : 0;
            
            // This is a simplified pie chart visualization
            // In a real app, you would calculate proper segments
            return (
              <div
                key={i}
                className={`absolute top-0 left-0 w-full h-full bg-${colors[i % colors.length]}-500 rounded-full`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((i / data.length) * 2 * Math.PI)}% ${50 - 50 * Math.sin((i / data.length) * 2 * Math.PI)}%, ${50 + 50 * Math.cos(((i + 1) / data.length) * 2 * Math.PI)}% ${50 - 50 * Math.sin(((i + 1) / data.length) * 2 * Math.PI)}%)`,
                  opacity: 0.8,
                }}
                title={`${item[index]}: ${valueFormatter(value)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-4 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center text-sm">
            <div className={`w-3 h-3 rounded-full bg-${colors[i % colors.length]}-500 mr-1`} />
            <span>{item[index]}: {valueFormatter(item[category] || 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartTooltip({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white shadow-lg rounded p-2 text-xs border">
      {children}
    </div>
  );
} 