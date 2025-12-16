import React from "react";

export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 shadow-xl ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-6">
          {title && (
            <h2 className="text-lg font-semibold text-indigo-300">{title}</h2>
          )}
          {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
        </div>
      )}

      <div className="p-6">{children}</div>
    </section>
  );
}
