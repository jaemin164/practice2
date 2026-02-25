import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-karrot-orange text-white shadow-md sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          🥕 당근마켓
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium">
          {user ? (
            <>
              <Link to="/products/new" className="bg-white text-karrot-orange px-3 py-1 rounded-full hover:bg-orange-50 transition">
                글쓰기
              </Link>
              <Link to="/chat" className="hover:underline">채팅</Link>
              <Link to="/me" className="hover:underline">{user.nickname}</Link>
              <button onClick={handleLogout} className="hover:underline opacity-80">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">로그인</Link>
              <Link to="/register" className="bg-white text-karrot-orange px-3 py-1 rounded-full hover:bg-orange-50 transition">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
