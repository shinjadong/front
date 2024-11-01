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
import MarketManagement from './components/MarketManagement';
import api from './utils/api';
import './styles/main.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (token && uid) {
        try {
          const response = await api.get('/user-info');
          if (response.data) {
            setIsLoggedIn(true);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    // API 연결 테스트
    const testConnection = async () => {
      try {
        await api.get('/ping');
        console.log('API 연결 성공');
      } catch (error) {
        console.error('API 연결 실패:', error);
      }
    };
    testConnection();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    window.location.href = '/login';
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
              <Route path="/markets" element={isLoggedIn ? <MarketManagement /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
