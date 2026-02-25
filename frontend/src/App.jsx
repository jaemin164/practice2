import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/new" element={<PrivateRoute><ProductCreate /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/chat/:roomId" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/me" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
