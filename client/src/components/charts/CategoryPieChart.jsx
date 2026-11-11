import React, { useState } from 'react';

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#64748b', // slate
];

function CategoryPieChart({ data = [], totalExpensesRupees = 0 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0 || totalExpensesRupees === 0) {
    return (
      <div className="chart-empty-state">
        <svg width="180" height="180" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="14"
            strokeDasharray="4 4"
          />
        </svg>
        <p className="chart-empty-text">No category data recorded</p>
        <span className="chart-empty-subtext">Expenses will be grouped by category here</span>
      </div>
    );
  }

  // Pre-calculate SVG arcs
  // Using circle with stroke-dasharray & stroke-dashoffset on radius 38
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = Math.max(0, item.percentage || 0);
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;
    const color = PALETTE[index % PALETTE.length];

    return {
      ...item,
      color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="pie-chart-container">
      <div className="pie-chart-visual">
        <svg
          viewBox="0 0 100 100"
          className="donut-svg"
          aria-label="Category Spending Donut Chart"
        >
          {slices.map((slice, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <circle
                key={slice.category}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? 16 : 13}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="donut-slice"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </svg>

        {/* Center overlay in the donut hole */}
        <div className="donut-center-info">
          {activeSlice ? (
            <>
              <span className="donut-center-label" style={{ color: activeSlice.color }}>
                {activeSlice.category}
              </span>
              <strong className="donut-center-value">
                Rs. {activeSlice.amountRupees.toFixed(2)}
              </strong>
              <span className="donut-center-sub">{activeSlice.percentage}%</span>
            </>
          ) : (
            <>
              <span className="donut-center-label">Total Spend</span>
              <strong className="donut-center-value">
                Rs. {Number(totalExpensesRupees).toFixed(2)}
              </strong>
              <span className="donut-center-sub">{data.length} Categories</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="pie-chart-legend">
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={slice.category}
              className={`legend-item ${isHovered ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="legend-marker" style={{ backgroundColor: slice.color }}></div>
              <div className="legend-details">
                <span className="legend-category">{slice.category}</span>
                <span className="legend-count">{slice.count} txns</span>
              </div>
              <div className="legend-metrics">
                <span className="legend-amount">Rs. {slice.amountRupees.toFixed(2)}</span>
                <span className="legend-percentage">{slice.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryPieChart;
