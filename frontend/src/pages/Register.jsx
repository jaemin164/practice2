import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', nickname: '', location: '' });
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
      const res = await authAPI.register(form);
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-8">🥕 회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow">
        {[
          { name: 'email', label: '이메일', type: 'email' },
          { name: 'password', label: '비밀번호', type: 'password' },
          { name: 'nickname', label: '닉네임', type: 'text' },
          { name: 'location', label: '동네 (예: 서울 마포구)', type: 'text' },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input name={name} type={type} value={form[name]} onChange={handleChange}
              required={name !== 'location'}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange" />
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-karrot-orange text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-60">
          {loading ? '처리 중...' : '회원가입'}
        </button>
        <p className="text-sm text-center text-gray-500">
          이미 계정이 있으신가요? <Link to="/login" className="text-karrot-orange font-medium">로그인</Link>
        </p>
      </form>
    </div>
  );
}
