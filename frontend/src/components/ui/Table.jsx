import React from 'react';

export const Table = ({ columns, data, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center text-center border border-border rounded-card bg-surface">
        <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-4 text-text-tertiary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">No data available</h3>
        <p className="text-sm text-text-secondary">There are no records to display here.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-card bg-surface">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-alt border-b border-border">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-border last:border-b-0 h-[52px] group ${onRowClick ? 'cursor-pointer hover:bg-surface-alt' : 'hover:bg-surface-alt/50'} ${rowIndex % 2 === 0 ? 'bg-surface' : 'bg-[#F8F7F4]'}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-3 px-5 text-sm text-text-primary whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
