import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = ['전자기기', '의류/잡화', '가구/인테리어', '도서', '스포츠/레저', '생활/가전', '기타'];

export default function ProductCreate() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    location: user?.location || '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImages(e) {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title || !form.price || !form.category) {
      return setError('필수 항목을 입력해주세요.');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      const res = await productAPI.create(fd);
      navigate(`/products/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || '등록 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">중고거래 글쓰기</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-2xl shadow">
        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2">사진 (최대 10장)</label>
          <div className="flex gap-2 flex-wrap">
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-karrot-orange text-gray-400 text-xs">
              <span className="text-2xl">+</span>
              <span>{images.length}/10</span>
              <input type="file" accept="image/*" multiple hidden onChange={handleImages} />
            </label>
            {previews.map((src, i) => (
              <img key={i} src={src} className="w-20 h-20 object-cover rounded-xl" />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">제목 *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            placeholder="글 제목" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">카테고리 *</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">가격 *</label>
          <div className="relative">
            <input name="price" type="number" value={form.price} onChange={handleChange} required min={0}
              placeholder="0" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange pr-8" />
            <span className="absolute right-3 top-2 text-sm text-gray-400">원</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">거래 지역</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="예: 서울 마포구" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">자세한 설명</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5}
            placeholder="브랜드, 구매 시기, 하자 유무 등 상품 설명을 자세히 적어주세요."
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-karrot-orange resize-none" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-karrot-orange text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-60">
          {loading ? '등록 중...' : '완료'}
        </button>
      </form>
    </div>
  );
}
