import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  Search, Filter, Download, Eye, ArrowLeft, 
  FileSpreadsheet, FileText, Calendar 
} from 'lucide-react';

const FormSubmissions = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await axios.get(`http://localhost:5000/api/forms/${formId}`);
        setForm(formRes.data);

        const subRes = await axios.get(`http://localhost:5000/api/forms/${formId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmissions(subRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [formId, token]);

  const filteredSubmissions = submissions.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    const name = sub.userId?.name?.toLowerCase() || '';
    const email = sub.userId?.email?.toLowerCase() || '';
    const code = sub.uniqueCode?.toLowerCase() || '';
    
    return name.includes(searchLower) || email.includes(searchLower) || code.includes(searchLower);
  });

  const exportToExcel = () => {
    const data = submissions.map(sub => {
      const row = {
        'Unique Code': sub.uniqueCode,
        'Name': sub.userId?.name || 'N/A',
        'Email': sub.userId?.email || 'N/A',
        'Date': new Date(sub.createdAt).toLocaleDateString() + ' ' + new Date(sub.createdAt).toLocaleTimeString(),
      };
      
      form.fields.forEach(field => {
        if (field.type !== 'section') {
            row[field.label] = sub.responses[field.label] || '';
        }
      });
      
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(workbook, `${form.title}_Submissions.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(form.title + " - Submissions", 14, 22);
    
    const validFields = form.fields.filter(f => f.type !== 'section');
    const tableColumn = ["Unique Code", "Name", "Email", "Date", ...validFields.map(f => f.label)];
    const tableRows = [];

    submissions.forEach(sub => {
      const row = [
        sub.uniqueCode,
        sub.userId?.name || 'N/A',
        sub.userId?.email || 'N/A',
        new Date(sub.createdAt).toLocaleDateString(),
        ...validFields.map(f => {
            const val = sub.responses[f.label];
            return typeof val === 'object' ? JSON.stringify(val) : (val || '');
        })
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] }
    });

    doc.save(`${form.title}_Submissions.pdf`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!form) return <div className="text-center mt-10 text-red-500">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{form.title}</h1>
                        <p className="text-sm text-gray-500">{submissions.length} Total Submissions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                    >
                        <FileSpreadsheet size={16} /> Export Excel
                    </button>
                    <button 
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                        <FileText size={16} /> Export PDF
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Name, Email or Code..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* Future: Date Filter can go here */}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600 text-sm">Unique Code</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Submitted At</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No submissions found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredSubmissions.map(sub => (
                                <tr key={sub._id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 font-mono text-blue-600 font-medium text-sm">
                                        {sub.uniqueCode}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{sub.userId?.name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{sub.userId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                            <span className="text-gray-400 text-xs">
                                                {new Date(sub.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Submission Details</h2>
                    <button 
                        onClick={() => setSelectedSubmission(null)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">User Name</div>
                            <div className="font-medium">{selectedSubmission.userId?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Email</div>
                            <div className="font-medium">{selectedSubmission.userId?.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Unique Code</div>
                            <div className="font-mono text-blue-600 font-bold">{selectedSubmission.uniqueCode}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Submitted Date</div>
                            <div className="font-medium">{new Date(selectedSubmission.createdAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Form Responses</h3>
                        {form.fields.map((field, idx) => {
                            if (field.type === 'section') {
                                return <h4 key={idx} className="font-bold text-blue-600 pt-2">{field.label}</h4>;
                            }
                            return (
                                <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                                    <div className="text-sm text-gray-500 mb-1">{field.label}</div>
                                    <div className="text-gray-900 font-medium">
                                        {selectedSubmission.responses[field.label] || <span className="text-gray-400 italic">No answer</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end">
                    <button 
                        onClick={() => setSelectedSubmission(null)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;
