
import React, { useMemo } from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface InteractiveChartProps {
  data: ChartData[];
  color?: string;
  height?: number;
  type?: 'line' | 'bar';
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  data, 
  color = '#D4AF37', 
  height = 200,
  type = 'line' 
}) => {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const width = 800;
  const padding = 40;

  const points = useMemo(() => {
    return data.map((d, i) => ({
      x: (i * (width - padding * 2)) / (data.length - 1) + padding,
      y: height - (d.value / max) * (height - padding * 2) - padding
    }));
  }, [data, max, height]);

  const pathData = useMemo(() => {
    if (points.length < 2) return '';
    return `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaData = useMemo(() => {
    if (points.length < 2) return '';
    return `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }, [pathData, points, height]);

  return (
    <div className="w-full relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Liniile de fundal */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i}
            x1={padding} 
            y1={height - padding - (height - padding * 2) * p} 
            x2={width - padding} 
            y2={height - padding - (height - padding * 2) * p} 
            stroke="white" 
            strokeOpacity="0.05" 
            strokeDasharray="4 4"
          />
        ))}

        {type === 'line' ? (
          <>
            <path d={areaData} fill="url(#chartGradient)" className="animate-pulse" />
            <path d={pathData} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i} className="cursor-pointer">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="6" 
                  fill="black" 
                  stroke={color} 
                  strokeWidth="3" 
                  className="hover:r-8 transition-all"
                />
                <text 
                  x={p.x} 
                  y={height - 10} 
                  textAnchor="middle" 
                  fill="white" 
                  fillOpacity="0.4" 
                  fontSize="10" 
                  fontWeight="bold"
                  className="uppercase tracking-widest"
                >
                  {data[i].label}
                </text>
              </g>
            ))}
          </>
        ) : (
          <g>
            {points.map((p, i) => {
              const barWidth = (width - padding * 2) / data.length * 0.6;
              const barHeight = height - padding - p.y;
              return (
                <g key={i}>
                  <rect 
                    x={p.x - barWidth / 2} 
                    y={p.y} 
                    width={barWidth} 
                    height={barHeight} 
                    fill={color} 
                    fillOpacity="0.2"
                    rx="4"
                    className="hover:fill-opacity-80 transition-all cursor-pointer"
                  />
                  <text x={p.x} y={height - 10} textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">
                    {data[i].label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

export default InteractiveChart;
