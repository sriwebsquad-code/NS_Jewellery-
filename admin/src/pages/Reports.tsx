import React, { useState } from 'react';
import { FileBarChart, Download, Calendar as CalendarIcon, Filter, RefreshCw, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports: React.FC = () => {
  const [type, setType] = useState('transactions');
  const [category, setCategory] = useState('digigold');
  
  // Default to this month
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const url = new URL('https://ns-jewellery.onrender.com/api/admin/reports');
      url.searchParams.append('type', type);
      url.searchParams.append('category', category);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      alert('Failed to fetch report data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetThisMonth = () => {
    const d = new Date();
    d.setDate(1);
    setStartDate(d.toISOString().slice(0, 10));
    setEndDate(new Date().toISOString().slice(0, 10));
  };

  const handleSetLastMonth = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    setStartDate(d.toISOString().slice(0, 10));
    
    const lastDay = new Date();
    lastDay.setDate(0); // Last day of previous month
    setEndDate(lastDay.toISOString().slice(0, 10));
  };

  const exportCSV = () => {
    if (reportData.length === 0) return;
    
    // Get headers
    const headers = Object.keys(reportData[0]).filter(k => k !== 'id' && k !== 'userId');
    
    // Convert data to CSV string
    const csvContent = [
      headers.map(h => h.toUpperCase()).join(','),
      ...reportData.map(row => 
        headers.map(header => {
          let val = row[header] === undefined || row[header] === null ? '' : String(row[header]);
          // Escape quotes and commas
          if (val.includes(',') || val.includes('"')) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${type}_${category}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`NS Jewellery - ${type.toUpperCase()} REPORT`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Category: ${category.replace('_', ' ').toUpperCase()}`, 14, 30);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 36);
    
    const headers = Object.keys(reportData[0]).filter(k => k !== 'id' && k !== 'userId');
    const tableData = reportData.map(row => headers.map(h => row[h]));

    (doc as any).autoTable({
      startY: 45,
      head: [headers.map(h => h.toUpperCase())],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] }, // Primary gold color
      styles: { fontSize: 8 },
    });

    doc.save(`report_${type}_${category}_${startDate}_to_${endDate}.pdf`);
  };

  // Helper to render table headers dynamically
  const renderHeaders = () => {
    if (reportData.length === 0) return null;
    const headers = Object.keys(reportData[0]).filter(k => k !== 'id' && k !== 'userId');
    return headers.map(h => (
      <th key={h} className="px-6 py-4 font-semibold text-left">{h.replace(/([A-Z])/g, ' $1').trim()}</th>
    ));
  };

  // Helper to render table rows
  const renderRows = () => {
    if (reportData.length === 0) return null;
    const headers = Object.keys(reportData[0]).filter(k => k !== 'id' && k !== 'userId');
    return reportData.map((row, i) => (
      <tr key={i} className="hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-0">
        {headers.map(h => (
          <td key={h} className="px-6 py-4 text-sm text-gray-700">
            {h === 'amount' || h === 'totalAmount' || h === 'maturityAmount' ? `₹${row[h]?.toLocaleString()}` : 
             h === 'weight' || h === 'totalWeight' ? `${Number(row[h]).toFixed(4)}g` :
             h === 'date' || h === 'joinedDate' ? new Date(row[h]).toLocaleString() :
             row[h]}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-serif text-secondary flex items-center">
              <FileBarChart className="mr-3 text-primary" size={28} />
              Reports
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Generate and export custom reports.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={exportCSV}
              disabled={reportData.length === 0}
              className={`flex items-center px-4 py-2 rounded font-medium transition-colors ${reportData.length > 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <FileText size={16} className="mr-2" /> CSV
            </button>
            <button 
              onClick={exportPDF}
              disabled={reportData.length === 0}
              className={`flex items-center px-4 py-2 rounded font-medium transition-colors ${reportData.length > 0 ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <Download size={16} className="mr-2" /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="transactions">Transactions (Revenue)</option>
              <option value="customers">Customers (New/Active)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="digigold">Digi Gold</option>
              <option value="digisilver">Digi Silver</option>
              <option value="gold_value">Gold Value Schemes</option>
              <option value="silver_value">Silver Value Schemes</option>
              <option value="gold_weight">Gold Weight Schemes</option>
              <option value="silver_weight">Silver Weight Schemes</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date Range</label>
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <div className="flex gap-2">
              <button onClick={handleSetThisMonth} className="flex-1 text-xs font-bold text-primary bg-primary/10 py-1.5 rounded hover:bg-primary/20">This Month</button>
              <button onClick={handleSetLastMonth} className="flex-1 text-xs font-bold text-gray-600 bg-gray-200 py-1.5 rounded hover:bg-gray-300">Last Month</button>
            </div>
            <button 
              onClick={fetchReport}
              className="w-full bg-secondary text-white p-2.5 rounded hover:bg-secondary/90 transition-colors flex items-center justify-center font-bold"
            >
              {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <><Filter size={18} className="mr-2" /> Generate Report</>}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden min-h-[400px]">
        {reportData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CalendarIcon size={48} className="mb-4 opacity-20" />
            <p>Select parameters and click "Generate Report" to view data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-background text-gray-500 text-[10px] uppercase tracking-widest border-b border-primary/10">
                  {renderHeaders()}
                </tr>
              </thead>
              <tbody>
                {renderRows()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
