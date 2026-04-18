import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, Trash2, Save, GripVertical, Settings, 
  Type, Mail, Hash, List, Calendar, CheckSquare, 
  CircleDot, AlignLeft, Clock, Heading, MoveUp, MoveDown 
} from 'lucide-react';

const FormBuilder = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('user');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { formId } = useParams();
  const token = localStorage.getItem('token');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdFormId, setCreatedFormId] = useState(null);

  // Field Types Configuration
  const FIELD_TYPES = [
    { type: 'text', label: 'Short Text', icon: <Type size={16} /> },
    { type: 'textarea', label: 'Long Text', icon: <AlignLeft size={16} /> },
    { type: 'email', label: 'Email', icon: <Mail size={16} /> },
    { type: 'number', label: 'Number', icon: <Hash size={16} /> },
    { type: 'select', label: 'Dropdown', icon: <List size={16} /> },
    { type: 'radio', label: 'Single Choice', icon: <CircleDot size={16} /> },
    { type: 'checkbox', label: 'Multiple Choice', icon: <CheckSquare size={16} /> },
    { type: 'date', label: 'Date', icon: <Calendar size={16} /> },
    { type: 'time', label: 'Time', icon: <Clock size={16} /> },
    { type: 'section', label: 'Section Header', icon: <Heading size={16} /> },
  ];

  const addField = (type) => {
    const newField = { 
      label: type === 'section' ? 'New Section' : '', 
      type, 
      required: false, 
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : [],
      placeholder: '',
      helpText: '',
      systemRole: 'none'
    };
    setFields([...fields, newField]);
  };

  const removeField = (index) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    }
  };

  const moveField = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === fields.length - 1)) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + direction];
    newFields[index + direction] = temp;
    setFields(newFields);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const addOption = (index) => {
    const newFields = [...fields];
    newFields[index].options.push(`Option ${newFields[index].options.length + 1}`);
    setFields(newFields);
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const newFields = [...fields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFields(newFields);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newFields = [...fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a form title');
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }
    
    // Validate labels
    const emptyLabels = fields.some(f => !f.label.trim());
    if (emptyLabels) {
        alert('All fields must have a label/question.');
        return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        targetRole,
        fields
      };

      let res;
      if (formId) {
        res = await axios.put(`http://localhost:5000/api/forms/${formId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Form updated successfully!');
        navigate('/admin');
      } else {
        res = await axios.post('http://localhost:5000/api/forms/create', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreatedFormId(res.data._id);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Server Error';
      alert(formId ? `Failed to update form: ${msg}` : `Failed to create form: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
              &larr;
            </button>
            <h1 className="text-xl font-bold text-gray-800">Form Builder</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Canvas */}
        <div className="flex-1 space-y-6">
          
          {/* Form Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input
                  type="text"
                  className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none px-2 py-1 transition"
                  placeholder="Untitled Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg p-3 text-gray-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="Describe the purpose of this form..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                  <select
                    className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white transition"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="user">User (Standard)</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="faculty">Faculty</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                <div className="text-gray-400 mb-2">
                  <Plus size={48} className="mx-auto opacity-20" />
                </div>
                <p className="text-gray-500 font-medium">Your form is empty</p>
                <p className="text-sm text-gray-400">Add fields from the menu to get started</p>
              </div>
            )}

            {fields.map((field, index) => (
              <div key={index} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200">
                
                {/* Field Header / Handle */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded text-xs font-bold uppercase tracking-wider">
                      {FIELD_TYPES.find(t => t.type === field.type)?.label || field.type}
                    </span>
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">
                      {field.label || 'Untitled Field'}
                    </span>
                    {field.required && <span className="text-red-500 text-xs">*Required</span>}
                  </div>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveField(index, -1)} 
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp size={18} />
                    </button>
                    <button 
                      onClick={() => moveField(index, 1)} 
                      disabled={index === fields.length - 1}
                      className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown size={18} />
                    </button>
                    <button 
                      onClick={() => removeField(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 ml-2"
                      title="Remove Field"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Field Edit Area */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Label / Question</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 outline-none"
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        placeholder="Enter question here..."
                      />
                    </div>

                    {field.type !== 'section' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Placeholder</label>
                          <input
                            type="text"
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 outline-none"
                            value={field.placeholder}
                            onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                            placeholder="e.g. Enter your answer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">System Map</label>
                          <select
                            className="w-full border rounded-lg p-2.5 bg-white"
                            value={field.systemRole}
                            onChange={(e) => updateField(index, 'systemRole', e.target.value)}
                          >
                            <option value="none">None</option>
                            <option value="name">User's Name</option>
                            <option value="email">User's Email</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {field.type !== 'section' && (
                     <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Help Text</label>
                       <input
                         type="text"
                         className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 outline-none"
                         value={field.helpText}
                         onChange={(e) => updateField(index, 'helpText', e.target.value)}
                         placeholder="Additional instructions for the user..."
                       />
                     </div>
                  )}

                  {/* Options for Select/Radio/Checkbox */}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Options</label>
                      <div className="space-y-2">
                        {field.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="p-1.5 bg-white border rounded">
                              {field.type === 'radio' && <CircleDot size={14} className="text-gray-400" />}
                              {field.type === 'checkbox' && <CheckSquare size={14} className="text-gray-400" />}
                              {field.type === 'select' && <List size={14} className="text-gray-400" />}
                            </div>
                            <input
                              type="text"
                              className="flex-1 border rounded p-1.5 text-sm focus:border-blue-500 outline-none"
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            />
                            <button
                              onClick={() => removeOption(index, optIndex)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(index)}
                          className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 mt-2"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {field.type !== 'section' && (
                    <div className="flex items-center gap-4 pt-2 border-t mt-2">
                      <label className="flex items-center cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          checked={field.required}
                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                        />
                        <span className="text-sm font-medium text-gray-700">Required Field</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Add Fields
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {FIELD_TYPES.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addField(ft.type)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                >
                  <div className="text-gray-500 group-hover:text-blue-600 transition-colors">
                    {ft.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {ft.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Created!</h2>
                <p className="text-gray-600 mb-6">Your form is ready to share.</p>
                
                <div className="bg-gray-50 p-3 rounded-lg border flex items-center gap-2 mb-6">
                    <code className="flex-1 text-sm text-gray-600 truncate text-left">
                        {`${window.location.origin}/signup/form/${createdFormId}`}
                    </code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/signup/form/${createdFormId}`);
                            alert('Link copied!');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Copy
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => {
                             window.open(`/signup/form/${createdFormId}`, '_blank');
                             navigate('/admin');
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        View Form
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
