import React, { useState } from 'react';
import { formatCurrencyAmount } from '../../utils/preferences';

function MonthlyBarChart({ data = [], summary = {} }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p className="chart-empty-text">No monthly trends recorded</p>
        <span className="chart-empty-subtext">Monthly spending will appear here as expenses are added</span>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amountRupees || 0), 10);
  // Round up max for nice axis ticks
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const barSlotWidth = innerWidth / data.length;
  const barWidth = Math.min(36, Math.max(16, barSlotWidth * 0.55));

  // Y-axis tick intervals
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = (maxAmount / tickCount) * i;
    return {
      value: val,
      y: paddingTop + innerHeight - (val / maxAmount) * innerHeight,
    };
  });

  return (
    <div className="monthly-chart-wrapper">
      <div className="chart-meta-bar">
        <div className="meta-stat">
          <span className="meta-label">Period Spending</span>
          <span className="meta-value">{formatCurrencyAmount(summary.totalPeriodSpendingRupees || 0)}</span>
        </div>
        <div className="meta-stat">
          <span className="meta-label">Monthly Average</span>
          <span className="meta-value">{formatCurrencyAmount(summary.averageMonthlyRupees || 0)}</span>
        </div>
        {summary.highestMonth && summary.highestMonth.amountRupees > 0 && (
          <div className="meta-stat">
            <span className="meta-label">Peak Month</span>
            <span className="meta-badge">{summary.highestMonth.monthLabel}</span>
          </div>
        )}
      </div>

      <div className="svg-container">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="bar-chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines and Y-axis labels */}
          {ticks.map((tick, idx) => (
            <g key={idx} className="grid-tick">
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={chartWidth - paddingRight}
                y2={tick.y}
                stroke="#f3f4f6"
                strokeDasharray={idx === 0 ? 'none' : '3 3'}
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="axis-label"
              >
                {formatCurrencyAmount(Math.round(tick.value))}
              </text>
            </g>
          ))}

          {/* Average spending line if positive */}
          {summary.averageMonthlyRupees > 0 && (
            <g className="average-line-group">
              {(() => {
                const avgY =
                  paddingTop +
                  innerHeight -
                  (Math.min(summary.averageMonthlyRupees, maxAmount) / maxAmount) * innerHeight;
                return (
                  <>
                    <line
                      x1={paddingLeft}
                      y1={avgY}
                      x2={chartWidth - paddingRight}
                      y2={avgY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartWidth - paddingRight}
                      y={avgY - 4}
                      textAnchor="end"
                      fill="#d97706"
                      fontSize="9"
                      fontWeight="600"
                    >
                      Avg
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = Math.max(
              item.amountRupees > 0 ? 4 : 0,
              (item.amountRupees / maxAmount) * innerHeight
            );
            const x = paddingLeft + index * barSlotWidth + (barSlotWidth - barWidth) / 2;
            const y = paddingTop + innerHeight - barHeight;
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={item.monthKey}
                className="bar-group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background hover column */}
                <rect
                  x={paddingLeft + index * barSlotWidth + 2}
                  y={paddingTop}
                  width={barSlotWidth - 4}
                  height={innerHeight}
                  fill={isHovered ? 'rgba(59, 130, 246, 0.05)' : 'transparent'}
                  rx="4"
                />

                {/* Data Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? '#3b82f6' : item.amountRupees > 0 ? '#0f172a' : '#e5e7eb'}
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Value label on top of bar if active or non-zero */}
                {isHovered && item.amountRupees > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="bar-value-tooltip"
                  >
                    {formatCurrencyAmount(item.amountRupees)}
                  </text>
                )}

                {/* X-axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`bar-x-label ${isHovered ? 'active' : ''}`}
                >
                  {item.monthLabel.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip info panel */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="chart-focus-banner">
          <span className="focus-month">{data[hoveredIndex].monthLabel}:</span>
          <span className="focus-amount">{formatCurrencyAmount(data[hoveredIndex].amountRupees)}</span>
          <span className="focus-count">({data[hoveredIndex].count} transactions)</span>
        </div>
      )}
    </div>
  );
}

export default MonthlyBarChart;
