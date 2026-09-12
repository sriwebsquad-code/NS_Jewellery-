import React from 'react';
import { X, Printer } from 'lucide-react';

export interface ReceiptData {
  id: string;
  receiptId?: string;
  date: string;
  type: string;
  details: string;
  amount: number | string;
  customerName?: string;
  customerPhone?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = async () => {
    // 1. Generate PDF and save if folder is configured
    try {
      const { getBackupDirectory, saveFileToBackup } = await import('../utils/fileSystem');
      const backupDir = await getBackupDirectory();
      
      if (backupDir) {
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;
        
        const printArea = document.getElementById('receipt-print-area');
        if (printArea) {
          // Add a temporary class to ensure rendering isn't compromised by being inside a hidden/fixed modal
          printArea.classList.add('bg-white');
          const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/png');
          
          // A5 size: 148 x 210 mm
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          const pdfBlob = pdf.output('blob');
          
          // Organize by type
          const subfolderName = data.type.toLowerCase().replace(/_/g, ' ');
          const fileName = `Receipt_${data.receiptId || data.id.slice(-8)}.pdf`;
          
          await saveFileToBackup(backupDir, subfolderName, fileName, pdfBlob);
        }
      }
    } catch (e) {
      console.error("Error saving backup:", e);
    }

    // 2. Open Print Dialog with A5 sizing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A5 portrait;
          margin: 0mm;
        }
        #root {
          display: none !important;
        }
        .print-only-container {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
          background: white;
          z-index: 999999;
        }
      }
      @media screen {
        .print-only-container {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    const printArea = document.getElementById('receipt-print-area');
    const printContainer = document.createElement('div');
    printContainer.className = 'print-only-container p-4 bg-white text-black';
    if (printArea) {
      printContainer.innerHTML = printArea.innerHTML;
    }
    document.body.appendChild(printContainer);
    
    // Brief delay to allow styles and images to apply/load in the cloned node
    setTimeout(() => {
      window.print();
      
      setTimeout(() => {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 1000);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 print:static print:bg-transparent print:p-0 print:block">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative flex flex-col print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Controls - Hidden in print */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <h3 className="font-serif font-bold text-lg text-secondary">Receipt / Bill</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 print:p-4 bg-white" id="receipt-print-area">
          <div className="text-center mb-6 pb-6 border-b border-gray-200 border-dashed">
            <img src="/rn_logo.png" alt="RN Logo" className="h-16 mx-auto mb-4 object-contain print:h-20" />
            <h1 className="text-2xl font-serif font-bold text-primary mb-1">NS Mahaveer Jewellery</h1>
            <p className="text-sm text-gray-500">Official Redemption Receipt</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-bold text-gray-800">{data.receiptId || data.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-800">{new Date(data.date).toLocaleString()}</span>
            </div>
            {data.customerName && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Customer Name</span>
                <span className="font-medium text-gray-800">{data.customerName}</span>
              </div>
            )}
            {data.customerPhone && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Mobile</span>
                <span className="font-medium text-gray-800">{data.customerPhone}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 print:bg-white print:border-gray-200 print:rounded-none">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</span>
              <span className="text-xs font-bold text-primary">{data.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Details</span>
              <span className="text-sm font-bold text-gray-800 text-right">{data.details}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Value</span>
              <span className="font-bold text-secondary text-lg">{data.amount}</span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 font-medium">
            <p>Thank you, revisit NS Mahaveer Jewellery</p>
            <p>This is a computer generated receipt.</p>
          </div>
        </div>

        {/* Action Buttons - Hidden in print */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2"
          >
            <Printer size={16} />
            <span>Print Bill</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
