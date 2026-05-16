import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Columns, Tags, Settings, LogOut } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Sem Nome' };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Início', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Minhas Tarefas', path: '/board', icon: <Columns size={20} /> },
    { name: 'Categorias', path: '/categories', icon: <Tags size={20} /> },
    { name: 'Configurações', path: '/profile', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex z-10 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Kanban<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Card Fixed at Bottom */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all mb-2 cursor-pointer group">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm group-hover:ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 transition-all overflow-hidden">
              {user?.avatar ? (
                <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}
            </div>
            <div className="flex flex-col truncate overflow-hidden flex-1">
               <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.name}</span>
               <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Ver Perfil</span>
            </div>
          </Link>

          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-[#0a0a0b] relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
