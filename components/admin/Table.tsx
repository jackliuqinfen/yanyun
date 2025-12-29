import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  pagination?: {
    pageSize: number;
  };
}

export function Table<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading = false, 
  searchPlaceholder = "搜索...", 
  onSearch,
  actions,
  pagination = { pageSize: 10 }
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item => 
      Object.values(item as any).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pagination.pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pagination.pageSize,
    currentPage * pagination.pageSize
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              onSearch?.(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
           {actions}
           <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <Filter size={18} />
           </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 font-semibold tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-slate-100/50' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                  style={{ width: col.width, textAlign: col.align }}
                >
                  <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                    {col.title}
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                     <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                     </div>
                  </td>
               </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((record) => (
                <tr key={record.id} className="group hover:bg-slate-50/60 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4" style={{ textAlign: col.align }}>
                      {col.render 
                        ? col.render(record[col.key as keyof T], record) 
                        : (record[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
               <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                     暂无数据
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
         <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
               显示 <span className="font-bold text-slate-700">{(currentPage - 1) * pagination.pageSize + 1}</span> 到 <span className="font-bold text-slate-700">{Math.min(currentPage * pagination.pageSize, sortedData.length)}</span> 条，共 <span className="font-bold text-slate-700">{sortedData.length}</span> 条
            </span>
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  <ArrowLeft size={16} />
               </button>
               {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                           ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                           : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                     }`}
                  >
                     {i + 1}
                  </button>
               ))}
               <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  <ArrowRight size={16} />
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
