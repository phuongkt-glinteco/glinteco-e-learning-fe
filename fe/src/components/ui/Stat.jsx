import React from 'react';
import { Icon } from '@iconify/react';

export default function Stat({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-surface border border-outline rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <Icon
            icon={icon}
            className={`w-5 h-5 ${accent ? 'text-primary' : 'text-slate-300'}`}
          />
        )}
      </div>
      <div
        className={`text-3xl font-bold mt-3 ${
          accent ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-on-surface-variant mt-2 font-medium">
          {sub}
        </div>
      )}
    </div>
  );
}
