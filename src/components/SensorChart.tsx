import React, { useState, useRef, useLayoutEffect } from 'react';

// --- INTERFACES ---
interface DataPoint {
  timestamp: string;
  value: number;
  [key: string]: any; // For combined chart data
}

interface Metric {
  key: string;
  label: string;
  unit: string;
  color: string;
  icon: string;
}

export interface SensorChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
  timeRange: string;
  metrics?: Metric[];
  combined?: boolean;
}

// --- TYPE FOR INTERNAL CHART ---
type ChartContentProps = SensorChartProps & {
  chartWidth: number;
};

// --- RESPONSIVE WRAPPER COMPONENT ---
function SensorChart(props: SensorChartProps) {
  const { data, combined } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // This hook measures the width of the parent div
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    
    // Use ResizeObserver to detect width changes
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setChartWidth(entries[0].contentRect.width);
      }
    });

    resizeObserver.observe(wrapperRef.current);
    
    // Clean up observer on unmount
    return () => resizeObserver.disconnect();
  }, []);

  // Set a min-height to prevent layout shift while measuring
  const minHeight = combined ? '300px' : '200px';

  // Handle the "No data" case
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-500"
        style={{ height: minHeight }}
      >
        No data available
      </div>
    );
  }

  // Render the wrapper. ChartContent will only render
  // once we have a measured width (chartWidth > 0).
  return (
    <div className="w-full" ref={wrapperRef} style={{ minHeight }}>
      {chartWidth > 0 && (
        <ChartContent {...props} chartWidth={chartWidth} />
      )}
    </div>
  );
}

// --- CHART RENDERING LOGIC ---
// This is your original component, but it now receives
// chartWidth as a prop instead of hard-coding it.
function ChartContent({ 
  data, 
  color, 
  unit, 
  timeRange, 
  metrics, 
  combined = false, 
  chartWidth 
}: ChartContentProps) {

  // Calculate chart dimensions and scales
  const chartHeight = combined ? 300 : 200;
  // Slightly smaller left padding for mobile
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }; 
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Fallback if container is too small
  if (innerWidth <= 0) {
    return (
      <div 
        className="flex items-center justify-center text-gray-500"
        style={{ height: chartHeight }}
      >
        Container too small
      </div>
    );
  }

  if (combined && metrics) {
    // Combined chart logic
    const normalizedData = data.map(point => {
      const normalized = { ...point };
      metrics.forEach(metric => {
        const values = data.map(d => d[metric.key]).filter(v => v !== undefined);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        normalized[`${metric.key}_normalized`] = range > 0 ? ((point[metric.key] - min) / range) * 100 : 50;
      });
      return normalized;
    });

    const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
    const yScale = (value: number) => innerHeight - (value / 100) * innerHeight;

    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      if (timeRange === '1h' || timeRange === '3h' || timeRange === '6h' || timeRange === '12h' || timeRange === '24h' || timeRange === 'today') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };

    const getXAxisTicks = () => {
      // **RESPONSIVE CHANGE**
      // Calculate ticks based on available width (e.g., ~80px per tick)
      const maxTicks = Math.max(2, Math.floor(innerWidth / 80));
      const step = Math.max(1, Math.floor(data.length / maxTicks));
      const ticks = [];
      for (let i = 0; i < data.length; i += step) {
        ticks.push(i);
      }
      if (ticks.length > 0 && ticks[ticks.length - 1] !== data.length - 1) {
        ticks.push(data.length - 1);
      }
      return ticks;
    };

    const xTicks = getXAxisTicks();

    return (
      <>
        {/* **RESPONSIVE CHANGE**: Removed overflow-x-auto wrapper */}
        {/* **RESPONSIVE CHANGE**: Removed min-w-full, width is now dynamic */}
        <svg width={chartWidth} height={chartHeight}>
          <defs>
            {metrics.map(metric => (
              <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: metric.color, stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: metric.color, stopOpacity: 0.02 }} />
              </linearGradient>
            ))}
          </defs>
          
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  y1={yScale(tick)}
                  x2={innerWidth}
                  y2={yScale(tick)}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text
                  x={-10}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-400"
                >
                  {tick}%
                </text>
              </g>
            ))}
            
            {/* Draw lines for each metric */}
            {metrics.map(metric => {
              const pathData = normalizedData.map((point, index) => {
                const x = xScale(index);
                const y = yScale(point[`${metric.key}_normalized`]);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ');

              const areaPath = `${pathData} L ${xScale(normalizedData.length - 1)} ${innerHeight} L ${xScale(0)} ${innerHeight} Z`;

              return (
                <g key={metric.key}>
                  <path
                    d={areaPath}
                    fill={`url(#gradient-${metric.key})`}
                  />
                  <path
                    d={pathData}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {normalizedData.map((point, index) => (
                    <circle
                      key={`${metric.key}-${index}`}
                      cx={xScale(index)}
                      cy={yScale(point[`${metric.key}_normalized`])}
                      r={2}
                      fill={metric.color}
                      className="hover:r-4 transition-all cursor-pointer"
                    >
                      <title>{`${metric.label}: ${point[metric.key]}${metric.unit} at ${formatTimestamp(point.timestamp)}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
            
            {/* Axes */}
            <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#d1d5db" strokeWidth={1} />
            <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#d1d5db" strokeWidth={1} />
            
            {/* X-axis labels */}
            {xTicks.map((tickIndex) => (
              <text
                key={tickIndex}
                x={xScale(tickIndex)}
                y={innerHeight + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600"
              >
                {formatTimestamp(data[tickIndex].timestamp)}
              </text>
            ))}
          </g>
        </svg>
        
        {/* Combined chart statistics (this was already responsive) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map(metric => {
            const values = data.map(d => d[metric.key]).filter(v => v !== undefined);
            const current = values[values.length - 1];
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            return (
              <div key={metric.key} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="font-semibold" style={{ color: metric.color }}>
                      {current?.toFixed(1)}{metric.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg</p>
                    <p className="font-semibold text-gray-700">
                      {average.toFixed(1)}{metric.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Range</p>
                    <p className="font-semibold text-gray-700">
                      {min.toFixed(1)}-{max.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // Single metric chart logic
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  const yPadding = valueRange * 0.1;

  const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) => 
    innerHeight - ((value - minValue + yPadding) / (valueRange + 2 * yPadding)) * innerHeight;

  const pathData = data.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = `${pathData} L ${xScale(data.length - 1)} ${innerHeight} L ${xScale(0)} ${innerHeight} Z`;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '1h' || timeRange === '3h' || timeRange === '6h' || timeRange === '12h' || timeRange === '24h' || timeRange === 'today') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getXAxisTicks = () => {
    // **RESPONSIVE CHANGE**
    const maxTicks = Math.max(2, Math.floor(innerWidth / 80));
    const step = Math.max(1, Math.floor(data.length / maxTicks));
    const ticks = [];
    for (let i = 0; i < data.length; i += step) {
      ticks.push(i);
    }
    if (ticks.length > 0 && ticks[ticks.length - 1] !== data.length - 1) {
      ticks.push(data.length - 1);
    }
    return ticks;
  };

  const getYAxisTicks = () => {
    const tickCount = 5;
    const ticks = [];
    const adjustedMin = minValue - yPadding;
    const adjustedMax = maxValue + yPadding;
    const step = (adjustedMax - adjustedMin) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      ticks.push(adjustedMin + step * i);
    }
    return ticks;
  };

  const xTicks = getXAxisTicks();
  const yTicks = getYAxisTicks();

  return (
    <>
      <svg width={chartWidth} height={chartHeight}>
        <defs>
          <linearGradient id={`gradient-${color?.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, index) => (
            <g key={index}>
              <line
                x1={0}
                y1={yScale(tick)}
                x2={innerWidth}
                y2={yScale(tick)}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
            </g>
          ))}
          
          <path
            d={areaPath}
            fill={`url(#gradient-${color?.replace('#', '')})`}
          />
          
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {data.map((point, index) => (
            <circle
              key={index}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r={3}
              fill={color}
              className="hover:r-4 transition-all cursor-pointer"
            >
              <title>{`${formatTimestamp(point.timestamp)}: ${point.value}${unit}`}</title>
            </circle>
          ))}
          
          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#d1d5db" strokeWidth={1} />
          <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#d1d5db" strokeWidth={1} />
          
          {/* Y-axis labels */}
          {yTicks.map((tick, index) => (
            <text
              key={index}
              x={-10}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-xs fill-gray-600"
            >
              {tick.toFixed(1)}
            </text>
          ))}
          
          {/* X-axis labels */}
          {xTicks.map((tickIndex) => (
            <text
              key={tickIndex}
              x={xScale(tickIndex)}
              y={innerHeight + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-600"
            >
              {formatTimestamp(data[tickIndex].timestamp)}
            </text>
          ))}
        </g>
      </svg>
      
      {/* Single chart statistics */}
      {/* **RESPONSIVE CHANGE**: Stacks on mobile (grid-cols-1), 3-col on larger (sm:grid-cols-3) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {/* **RESPONSIVE CHANGE**: Aligns left on mobile, center on larger */}
        <div className="text-left sm:text-center">
          <p className="text-gray-600">Current</p>
          <p className="font-semibold" style={{ color }}>
            {data[data.length - 1]?.value.toFixed(2)}{unit}
          </p>
        </div>
        <div className="text-left sm:text-center">
          <p className="text-gray-600">Average</p>
          <p className="font-semibold text-gray-900">
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}{unit}
          </p>
        </div>
        <div className="text-left sm:text-center">
          <p className="text-gray-600">Range</p>
          <p className="font-semibold text-gray-900">
            {minValue.toFixed(1)} - {maxValue.toFixed(1)}{unit}
          </p>
        </div>
      </div>
    </>
  );
}

export default SensorChart;