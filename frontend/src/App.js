import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pages from './pages/Pages';
import PageForm from './pages/PageForm';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Config from './pages/Config';
import Profile from './pages/Profile';
import PublicPages from './pages/PublicPages';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public" element={<PublicPages />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/pages" element={
              <ProtectedRoute><Layout><Pages /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/pages/new" element={
              <ProtectedRoute><Layout><PageForm /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/pages/edit/:id" element={
              <ProtectedRoute><Layout><PageForm /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/users" element={
              <ProtectedRoute roles={['admin']}><Layout><Users /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/resources" element={
              <ProtectedRoute roles={['admin', 'editor']}><Layout><Resources /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/config" element={
              <ProtectedRoute roles={['admin']}><Layout><Config /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
