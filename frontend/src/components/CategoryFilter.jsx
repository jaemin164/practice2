const CATEGORIES = ['전체', '전자기기', '의류/잡화', '가구/인테리어', '도서', '스포츠/레저', '생활/가전', '기타'];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === '전체' ? '' : cat)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition border ${
            (selected === '' && cat === '전체') || selected === cat
              ? 'bg-karrot-orange text-white border-karrot-orange'
              : 'bg-white text-gray-600 border-gray-200 hover:border-karrot-orange'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
