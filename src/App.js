import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import CollectedProducts from './components/CollectedProducts';
import TaobaoMatch from './components/TaobaoMatch';
import Login from './components/Login';
import Signup from './components/Signup';
import { getUserInfo } from './utils/api';
import './styles/main.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await getUserInfo(); // 유효한 토큰인지 확인
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('uid');
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('userInfo');
  };

  if (loading) {
    return <div>Loading...</div>; // 또는 로딩 스피너 컴포넌트
  }

  return (
    <Router>
      <div className="app">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div className="main-container">
          {isLoggedIn && <Sidebar />}
          <main className="content">
            <Routes>
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/search" element={isLoggedIn ? <SearchPage /> : <Navigate to="/login" />} />
              <Route path="/collected" element={isLoggedIn ? <CollectedProducts /> : <Navigate to="/login" />} />
              <Route path="/taobao-match" element={isLoggedIn ? <TaobaoMatch /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
