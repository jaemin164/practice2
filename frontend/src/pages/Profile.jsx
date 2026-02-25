import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuthStore();
  const isMe = !id || id === String(me?.id);
  const userId = isMe ? me?.id : id;

  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', location: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (!userId) return navigate('/login');
    userAPI.getProfile(userId).then((res) => {
      setProfile(res.data);
      setProducts(res.data.products || []);
      setEditForm({ nickname: res.data.nickname, location: res.data.location });
    }).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (tab === 'likes' && isMe) {
      userAPI.getMyLikes().then((res) => setLikes(res.data));
    }
  }, [tab, isMe]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nickname', editForm.nickname);
    fd.append('location', editForm.location);
    if (avatarFile) fd.append('avatar', avatarFile);
    const res = await userAPI.updateProfile(fd);
    updateUser(res.data);
    setProfile((p) => ({ ...p, ...res.data }));
    setEditMode(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">불러오는 중...</div>;
  if (!profile) return <div className="text-center py-16 text-gray-400">사용자를 찾을 수 없어요.</div>;

  return (
    <div>
      {/* 프로필 헤더 */}
      <div className="bg-white rounded-2xl p-5 shadow mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              {(avatarPreview || profile.avatar) ? (
                <img src={avatarPreview || profile.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            {editMode && (
              <button onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 w-5 h-5 bg-karrot-orange rounded-full text-white text-xs flex items-center justify-center">
                +
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </button>
            )}
          </div>

          <div className="flex-1">
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-2">
                <input value={editForm.nickname} onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))}
                  className="border rounded-lg px-2 py-1 text-sm w-full outline-none focus:border-karrot-orange" />
                <input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="동네 입력" className="border rounded-lg px-2 py-1 text-sm w-full outline-none focus:border-karrot-orange" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-karrot-orange text-white px-3 py-1 rounded-lg text-xs">저장</button>
                  <button type="button" onClick={() => setEditMode(false)} className="border px-3 py-1 rounded-lg text-xs">취소</button>
                </div>
              </form>
            ) : (
              <>
                <p className="font-bold text-lg">{profile.nickname}</p>
                <p className="text-sm text-gray-400">{profile.location}</p>
                <p className="text-sm text-orange-500 font-medium">매너온도 {profile.mannerScore?.toFixed(1)}°C 🌡</p>
              </>
            )}
          </div>

          {isMe && !editMode && (
            <button onClick={() => setEditMode(true)} className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              프로필 수정
            </button>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b mb-4">
        {[
          { key: 'products', label: '판매 상품' },
          ...(isMe ? [{ key: 'likes', label: '관심 목록' }] : []),
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === key ? 'border-karrot-orange text-karrot-orange' : 'border-transparent text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      <div>
        {tab === 'products' && (
          products.length === 0 ? <p className="text-center py-10 text-gray-400">판매 상품이 없어요</p>
            : products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
        {tab === 'likes' && (
          likes.length === 0 ? <p className="text-center py-10 text-gray-400">관심 상품이 없어요</p>
            : likes.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}
