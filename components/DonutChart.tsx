
import React from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  className?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, className = '' }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-text-light-secondary dark:text-text-dark-secondary italic opacity-50">Nicio dată disponibilă</div>;
  }

  let cumulative = 0;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulative;
            cumulative += percentage;

            return (
              <circle
                key={index}
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke={item.color}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ transitionDelay: `${index * 150}ms` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tighter text-text-light-primary dark:text-white leading-none">{total}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-light-secondary dark:text-white/40 mt-1">Înrolați</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-10">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-text-light-primary dark:text-white">{item.label}</span>
              <span className="text-[10px] font-bold text-text-light-secondary dark:text-white/30">{Math.round((item.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
