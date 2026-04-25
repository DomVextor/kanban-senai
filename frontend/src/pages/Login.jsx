import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(isLogin 
          ? { email: formData.email, password: formData.password }
          : formData
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro');
      }

      // Store tokens and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Kanban<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {isLogin ? 'Faça login na sua conta' : 'Crie sua conta gratuita'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
          
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nome Completo
                </label>
                <div className="mt-1">
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Endereço de Email
              </label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Senha
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                  {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="flex w-full justify-center rounded-xl border-2 border-zinc-200 dark:border-zinc-700/50 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
              >
                {isLogin ? 'Criar nova conta' : 'Fazer login'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
