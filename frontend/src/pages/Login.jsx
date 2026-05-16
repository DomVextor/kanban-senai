import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      let userCredential;
      let userData;

      if (isLogin) {
        // LogIn com Firebase
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        userData = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || formData.email.split('@')[0],
          email: userCredential.user.email,
          avatar: userCredential.user.photoURL
        };
      } else {
        // Cadastro com Firebase
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Gerar avatar aleatório e diversificado
        const diverseSeeds = ['Aidan', 'Destiny', 'Jocelyn', 'Avery', 'Liam', 'Mason', 'Sofia', 'Valentina', 'Chloe', 'Elijah'];
        const randomSeed = diverseSeeds[Math.floor(Math.random() * diverseSeeds.length)];
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

        await updateProfile(userCredential.user, {
          displayName: formData.name,
          photoURL: avatarUrl
        });

        userData = {
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          avatar: avatarUrl
        };
      }

      // Store tokens and redirect
      localStorage.setItem('token', await userCredential.user.getIdToken());
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro ao autenticar. Tente novamente.');
      }
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
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 pr-10 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
