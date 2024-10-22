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
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`로그인 실패: ${error.response.data.error}`);
      } else {
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
        />
        <button type="submit">로그인</button>
      </form>
      <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
    </div>
  );
}

export default Login;
