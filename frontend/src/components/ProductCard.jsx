import { Link } from 'react-router-dom';

const STATUS_LABEL = { SELLING: null, RESERVED: '예약중', SOLD: '거래완료' };

export default function ProductCard({ product }) {
  const thumb = product.images?.[0] ? product.images[0] : null;
  const statusLabel = STATUS_LABEL[product.status];

  return (
    <Link to={`/products/${product.id}`} className="flex gap-3 py-4 border-b last:border-b-0 hover:bg-gray-50 transition">
      <div className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
        {thumb ? (
          <img src={thumb} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            {statusLabel && (
              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{statusLabel}</span>
            )}
            <h3 className="text-sm font-medium text-gray-900 truncate">{product.title}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{product.location} · {timeAgo(product.createdAt)}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{product.price.toLocaleString()}원</span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {product._count?.chatRooms > 0 && <span>💬 {product._count.chatRooms}</span>}
            {product._count?.likes > 0 && <span>❤️ {product._count.likes}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
