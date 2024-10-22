import React, { useState } from 'react';
import { login } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      localStorage.setItem('uid', result.uid);
      localStorage.setItem('token', result.token);
      if (result.user) {
        localStorage.setItem('userInfo', JSON.stringify(result.user));
      }
      setIsLoggedIn(true);
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>AI 소싱 로그인</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">로그인</button>
        </form>
        <p className="signup-link">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </div>
    </div>
  );
}

export default Login;
