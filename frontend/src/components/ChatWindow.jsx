import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../api';
import { useAuthStore } from '../store/authStore';

export default function ChatWindow({ room }) {
  const { token, user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    chatAPI.getMessages(room.id).then((res) => setMessages(res.data));

    const socket = io('/', { auth: { token } });
    socketRef.current = socket;
    socket.emit('join_room', room.id);
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [room.id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    socketRef.current?.emit('send_message', { roomId: room.id, content: input.trim() });
    setInput('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 bg-white">
        <p className="font-medium">{room.product.title}</p>
        <p className="text-sm text-karrot-orange font-bold">{room.product.price.toLocaleString()}원</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                  {msg.sender?.avatar ? <img src={msg.sender.avatar} className="w-full h-full object-cover" /> : '👤'}
                </div>
              )}
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-karrot-orange text-white' : 'bg-white border'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t p-3 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-karrot-orange"
        />
        <button type="submit" className="bg-karrot-orange text-white px-4 py-2 rounded-full text-sm font-medium">
          전송
        </button>
      </form>
    </div>
  );
}
