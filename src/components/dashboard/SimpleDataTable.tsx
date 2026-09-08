import React from 'react';

interface Column {
  header: string;
  accessorKey: string;
}

interface SimpleDataTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export function SimpleDataTable({ columns, data }: SimpleDataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
        لا توجد بيانات للعرض حالياً.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View: Standard Table */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-6 py-4 font-bold whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition-colors hover:bg-slate-50/50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 font-medium text-slate-700">
                      {row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: Stacked Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              {columns.map((col, colIndex) => (
                <div 
                  key={colIndex} 
                  className="flex justify-between gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-bold text-slate-500 shrink-0">{col.header}</span>
                  <span className="text-sm font-medium text-slate-800 text-left">{row[col.accessorKey]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
