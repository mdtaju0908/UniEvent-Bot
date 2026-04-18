import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PublicForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  
  // Dynamic fields responses
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/forms/${formId}`);
        setForm(res.data);
        setLoading(false);
      } catch (err) {
        setError('Form not found or server error');
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handleResponseChange = (label, value) => {
    setResponses(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleCheckboxChange = (label, option, checked) => {
    setResponses(prev => {
      const currentValues = prev[label] || [];
      // Ensure currentValues is an array (it might be undefined initially)
      const newValues = Array.isArray(currentValues) ? [...currentValues] : [];
      
      if (checked) {
        newValues.push(option);
      } else {
        const index = newValues.indexOf(option);
        if (index > -1) {
          newValues.splice(index, 1);
        }
      }
      return { ...prev, [label]: newValues };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/forms/submit/${formId}`, {
        responses
      });
      setSuccessData(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Form Submitted Successful!</h2>
          <p className="text-gray-600 mb-6">Save Your Qnique Code for Future Reference</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold mb-2">YOUR UNIQUE CODE</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-white px-4 py-2 rounded border text-xl font-mono font-bold tracking-wider">
                {successData.user.uniqueCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(successData.user.uniqueCode);
                  alert('Code copied!');
                }}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                title="Copy Code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Form Header */}
        <div className="bg-blue-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
            <p className="opacity-90">{form.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {form.fields.map((field, index) => {
            if (field.type === 'section') {
                return (
                    <div key={index} className="pt-4 border-b border-gray-200 pb-2">
                        <h3 className="text-xl font-bold text-gray-800">{field.label}</h3>
                    </div>
                );
            }

            return (
              <div key={index}>
                <label className="block text-gray-700 font-semibold mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                    <textarea
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        rows="4"
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={(e) => handleResponseChange(field.label, e.target.value)}
                    />
                ) : field.type === 'select' ? (
                  <select
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    required={field.required}
                    onChange={(e) => handleResponseChange(field.label, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select an option</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                    <div className="space-y-2">
                        {field.options && field.options.length > 0 ? (
                            field.options.map((opt, i) => (
                                <label key={i} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))
                        ) : (
                            // Fallback for single checkbox (boolean)
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    required={field.required}
                                    onChange={(e) => handleResponseChange(field.label, e.target.checked ? 'Yes' : 'No')}
                                />
                                <span className="text-gray-700">Yes</span>
                            </label>
                        )}
                    </div>
                ) : field.type === 'radio' ? (
                    <div className="space-y-2">
                        {field.options.map((opt, i) => (
                            <label key={i} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name={field.label}
                                    value={opt}
                                    required={field.required}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    onChange={(e) => handleResponseChange(field.label, e.target.value)}
                                />
                                <span className="text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                  <input
                    type={field.type}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleResponseChange(field.label, e.target.value)}
                  />
                )}
                
                {field.helpText && (
                    <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
                )}
              </div>
            );
          })}

          <div className="pt-6">
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-[1.01]"
            >
                Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicForm;
