import React from 'react';

function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="crystal-card text-center py-12">
        <p className="text-medical-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="crystal-card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-medical-border">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-right text-sm font-semibold text-medical-text"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-medical-border hover:bg-medical-light transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm text-medical-text">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
