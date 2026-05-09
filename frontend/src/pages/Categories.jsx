import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Tags, Save, X, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const COLORS = [
  { label: 'Cinza', value: 'bg-slate-100 text-slate-700', hex: 'bg-slate-500' },
  { label: 'Vermelho', value: 'bg-red-100 text-red-700', hex: 'bg-red-500' },
  { label: 'Laranja', value: 'bg-orange-100 text-orange-700', hex: 'bg-orange-500' },
  { label: 'Âmbar', value: 'bg-amber-100 text-amber-700', hex: 'bg-amber-500' },
  { label: 'Amarelo', value: 'bg-yellow-100 text-yellow-700', hex: 'bg-yellow-500' },
  { label: 'Lima', value: 'bg-lime-100 text-lime-700', hex: 'bg-lime-500' },
  { label: 'Verde', value: 'bg-green-100 text-green-700', hex: 'bg-green-500' },
  { label: 'Esmeralda', value: 'bg-emerald-100 text-emerald-700', hex: 'bg-emerald-500' },
  { label: 'Turquesa', value: 'bg-teal-100 text-teal-700', hex: 'bg-teal-500' },
  { label: 'Ciano', value: 'bg-cyan-100 text-cyan-700', hex: 'bg-cyan-500' },
  { label: 'Azul Céu', value: 'bg-sky-100 text-sky-700', hex: 'bg-sky-500' },
  { label: 'Azul', value: 'bg-blue-100 text-blue-700', hex: 'bg-blue-500' },
  { label: 'Índigo', value: 'bg-indigo-100 text-indigo-700', hex: 'bg-indigo-500' },
  { label: 'Violeta', value: 'bg-violet-100 text-violet-700', hex: 'bg-violet-500' },
  { label: 'Roxo', value: 'bg-purple-100 text-purple-700', hex: 'bg-purple-500' },
  { label: 'Fúcsia', value: 'bg-fuchsia-100 text-fuchsia-700', hex: 'bg-fuchsia-500' },
  { label: 'Rosa', value: 'bg-pink-100 text-pink-700', hex: 'bg-pink-500' },
  { label: 'Rubi', value: 'bg-rose-100 text-rose-700', hex: 'bg-rose-500' }
];

export default function Categories() {
  const queryClient = useQueryClient();
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { id: null };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0].value });
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) return;

    const q = query(collection(db, 'categories'), where('user_id', '==', user.id));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
      queryClient.setQueryData(['categories'], data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [queryClient, user.id]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', String(editingCategory.id)), payload);
      } else {
        await addDoc(collection(db, 'categories'), { ...payload, user_id: user.id });
      }
    },
    onSuccess: () => {
      closeModal();
    },
    onError: (err) => setError(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, 'categories', String(id)));
    },
    onSuccess: () => {
      setError('');
    },
    onError: (err) => setError(err.message)
  });

  const openModal = (cat = null) => {
    setError('');
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, color: cat.color });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: COLORS[0].value });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nome obrigatório.');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja apagar essa categoria?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm flex items-center gap-3">
             <Tags className="text-purple-500" />
             Categorias Estruturais
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Gerencie as raízes das suas tarefas.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Nova Categoria
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Grid Container in Glassmorphism */}
      <div className="flex-1 p-8 rounded-3xl bg-white/60 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/40 dark:border-zinc-800/50 shadow-xl overflow-y-auto">
        {isLoading ? (
           <div className="text-center py-10 text-zinc-500">Carregando categorias...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="relative p-6 rounded-3xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all group flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                
                {/* Visual Icon Box */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${cat.color}`}>
                  <Tags size={28} />
                </div>
                
                {/* Info Text */}
                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 truncate w-full mb-1">{cat.name}</h3>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Etiqueta
                </span>

                {/* Floating Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => openModal(cat)} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Decorator Line */}
                <div className={`absolute bottom-0 left-0 h-1.5 w-full ${COLORS.find(c => c.value === cat.color)?.hex || 'bg-zinc-500'}`}></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex: Trabalho"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cor da Tag</label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: c.value})}
                      className={`h-8 w-full rounded-md border-2 transition-all flex items-center justify-center ${c.hex} ${formData.color === c.value ? 'border-zinc-800 dark:border-white scale-110 shadow-md ring-2 ring-indigo-500/50' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-300">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2">
                  <Save size={16} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
