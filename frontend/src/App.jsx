import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import KanbanBoard from './pages/KanbanBoard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Categories from './pages/Categories'

// Helper para validar autenticação
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="board" element={<KanbanBoard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
