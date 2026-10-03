"use client";

import { useState } from "react";
import { documentCategories } from "@/lib/resources";

export function DocumentRequirements() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = documentCategories[activeIndex];

  return (
    <section className="pb-20 bg-cream" aria-label="Documents required by process">
      <div className="mx-auto max-w-[1280px] px-6">
        <div
          role="tablist"
          aria-label="Document categories"
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {documentCategories.map((category, i) => {
            const selected = i === activeIndex;
            return (
              <button
                key={category.category}
                id={`doc-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`doc-panel-${i}`}
                onClick={() => setActiveIndex(i)}
                className={`mono-label cursor-pointer px-4 py-2 rounded-full text-[10px] transition-colors border ${
                  selected
                    ? "bg-teal text-white border-teal"
                    : "bg-white text-ink-dim border-border hover:bg-teal-tint hover:text-teal"
                }`}
              >
                {category.category}
              </button>
            );
          })}
        </div>

        <div
          id={`doc-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`doc-tab-${activeIndex}`}
          tabIndex={0}
          className="reveal waybill max-w-3xl mx-auto bg-white rounded-2xl p-6 lg:p-8 shadow-[0_1px_3px_rgba(30,27,24,0.04)]"
        >
          <h2 className="text-xl font-semibold text-ink mb-5">
            {activeCategory.category} Documents
          </h2>
          <ul className="list-none m-0 p-0 space-y-3">
            {activeCategory.docs.map((doc, n) => (
              <li
                key={doc}
                className="flex items-center gap-3 bg-cream border border-border rounded-xl p-3"
              >
                <span className="mono-label w-7 h-7 rounded-full bg-teal-tint text-teal text-[10px] flex items-center justify-center shrink-0">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <span className="text-ink text-sm leading-relaxed">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
