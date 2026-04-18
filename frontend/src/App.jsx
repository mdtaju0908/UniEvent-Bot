import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import AdminPanel from './pages/AdminPanel';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import FormSubmissions from './pages/FormSubmissions';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminPending from './pages/AdminPending';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/pending" element={<AdminPending />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/admin/create-form" element={<FormBuilder />} />
          <Route path="/admin/edit-form/:formId" element={<FormBuilder />} />
          <Route path="/admin/forms/:formId/submissions" element={<FormSubmissions />} />
          <Route path="/signup/form/:formId" element={<PublicForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
      <Chatbot />
    </div>
  );
}

export default App;
