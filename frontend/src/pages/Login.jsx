import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-8">🥕 로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-karrot-orange text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-60">
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <p className="text-sm text-center text-gray-500">
          계정이 없으신가요? <Link to="/register" className="text-karrot-orange font-medium">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
