import React, { useState } from 'react';
import { login } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/main.css'; // 스타일 시트 추가

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      localStorage.setItem('uid', result.uid);
      if (result.user) {
        localStorage.setItem('userInfo', JSON.stringify(result.user));
      }
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(error.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in enhanced-login">
      <h2 className="auth-title">로그인</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            className="auth-input"
          />
          <label htmlFor="loginEmail" className="auth-label">이메일</label>
        </div>
        <div className="input-group">
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
            className="auth-input"
          />
          <label htmlFor="loginPassword" className="auth-label">비밀번호</label>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="signup-link">
        계정이 없���신가요? <Link to="/signup" className="signup-link-text">회원가입</Link>
      </p>
    </div>
  );
}

export default Login;
