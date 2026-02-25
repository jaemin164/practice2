import { useEffect, useState } from 'react';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    productAPI.getAll({ category, search: query, page }).then((res) => {
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    }).finally(() => setLoading(false));
  }, [category, query, page]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-karrot-orange"
        />
        <button type="submit" className="bg-karrot-orange text-white px-4 py-2 rounded-full text-sm">검색</button>
      </form>

      <CategoryFilter selected={category} onChange={(c) => { setCategory(c); setPage(1); }} />

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-16 text-gray-400">불러오는 중...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>상품이 없어요</p>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm ${p === page ? 'bg-karrot-orange text-white' : 'bg-white border'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
