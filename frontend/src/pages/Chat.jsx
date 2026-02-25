import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../api';
import ChatWindow from '../components/ChatWindow';
import { useAuthStore } from '../store/authStore';

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getMyRooms().then((res) => {
      setRooms(res.data);
      if (roomId) {
        const found = res.data.find((r) => r.id === Number(roomId));
        if (found) setActiveRoom(found);
      }
    }).finally(() => setLoading(false));
  }, [roomId]);

  function selectRoom(room) {
    setActiveRoom(room);
    navigate(`/chat/${room.id}`);
  }

  if (loading) return <div className="text-center py-16 text-gray-400">불러오는 중...</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-2xl overflow-hidden bg-white shadow">
      {/* 채팅방 목록 */}
      <div className="w-64 border-r flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b font-bold text-sm">채팅</div>
        {rooms.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">채팅 내역이 없어요</div>
        ) : (
          rooms.map((room) => {
            const partner = room.product.sellerId === user.id ? room.buyer : room.product;
            const lastMsg = room.messages?.[0];
            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${activeRoom?.id === room.id ? 'bg-karrot-light' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                    {room.buyer.avatar && <img src={room.buyer.avatar} className="w-full h-full object-cover rounded-full" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{room.buyer.nickname}</p>
                    <p className="text-xs text-gray-400 truncate">{room.product.title}</p>
                  </div>
                </div>
                {lastMsg && <p className="text-xs text-gray-500 truncate">{lastMsg.content}</p>}
              </button>
            );
          })
        )}
      </div>

      {/* 채팅창 */}
      <div className="flex-1">
        {activeRoom ? (
          <ChatWindow room={activeRoom} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p>채팅방을 선택하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
