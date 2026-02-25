import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, chatAPI } from '../api';
import { useAuthStore } from '../store/authStore';

const STATUS_OPTIONS = [
  { value: 'SELLING', label: '판매중' },
  { value: 'RESERVED', label: '예약중' },
  { value: 'SOLD', label: '거래완료' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    productAPI.getOne(id).then((res) => setProduct(res.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleLike() {
    if (!user) return navigate('/login');
    const res = await productAPI.toggleLike(id);
    setProduct((p) => ({
      ...p,
      isLiked: res.data.liked,
      _count: { ...p._count, likes: p._count.likes + (res.data.liked ? 1 : -1) },
    }));
  }

  async function handleChat() {
    if (!user) return navigate('/login');
    const res = await chatAPI.getOrCreateRoom(id);
    navigate(`/chat/${res.data.id}`);
  }

  async function handleStatusChange(e) {
    await productAPI.update(id, { status: e.target.value });
    setProduct((p) => ({ ...p, status: e.target.value }));
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await productAPI.delete(id);
    navigate('/');
  }

  if (loading) return <div className="text-center py-16 text-gray-400">불러오는 중...</div>;
  if (!product) return <div className="text-center py-16 text-gray-400">상품을 찾을 수 없어요.</div>;

  const isMine = user?.id === product.seller.id;

  return (
    <div className="pb-24">
      {/* 이미지 슬라이더 */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-4">
        {product.images.length > 0 ? (
          <>
            <img src={product.images[imgIdx]} alt={product.title} className="w-full h-full object-cover" />
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-karrot-orange' : 'bg-white/70'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
        )}
      </div>

      {/* 판매자 정보 */}
      <Link to={`/profile/${product.seller.id}`} className="flex items-center gap-3 p-3 border-b mb-4 hover:bg-gray-50">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          {product.seller.avatar ? <img src={product.seller.avatar} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">👤</span>}
        </div>
        <div>
          <p className="font-medium text-sm">{product.seller.nickname}</p>
          <p className="text-xs text-gray-400">{product.seller.location}</p>
        </div>
        <div className="ml-auto text-xs text-gray-400">매너온도 {product.seller.mannerScore?.toFixed(1)}°C</div>
      </Link>

      {/* 상품 정보 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{product.category}</span>
          {product.status !== 'SELLING' && (
            <span className={`text-xs px-2 py-0.5 rounded ${product.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>
              {product.status === 'RESERVED' ? '예약중' : '거래완료'}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold mb-2">{product.title}</h1>
        <p className="text-xs text-gray-400 mb-3">{product.location} · 조회 {product.viewCount}회</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
      </div>

      {/* 판매자 전용 상태 변경/삭제 */}
      {isMine && (
        <div className="flex gap-2 mt-4 mb-4">
          <select value={product.status} onChange={handleStatusChange}
            className="border rounded-lg px-3 py-2 text-sm flex-1 focus:border-karrot-orange outline-none">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={handleDelete} className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50">
            삭제
          </button>
        </div>
      )}

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center gap-4 max-w-2xl mx-auto">
        <button onClick={handleLike} className="flex flex-col items-center text-xs gap-0.5">
          <span className="text-xl">{product.isLiked ? '❤️' : '🤍'}</span>
          <span className="text-gray-500">{product._count.likes}</span>
        </button>
        <div className="flex-1">
          <p className="font-bold text-lg">{product.price.toLocaleString()}원</p>
        </div>
        {!isMine && (
          <button onClick={handleChat}
            className="bg-karrot-orange text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition">
            채팅하기
          </button>
        )}
      </div>
    </div>
  );
}
