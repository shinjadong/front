import React, { useState } from 'react';
import { signup } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/main.css'; // 스타일 시트 추가

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting signup with:', { email, name });
      const result = await signup(email, password, name);
      console.log('Signup successful:', result);
      alert('회원가입 성공! 로그인 해주세요.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in enhanced-signup">
      <h2 className="auth-title">회원가입</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            id="signupEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            className="auth-input"
          />
          <label htmlFor="signupEmail" className="auth-label">이메일</label>
        </div>
        <div className="input-group">
          <input
            type="password"
            id="signupPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
            className="auth-input"
          />
          <label htmlFor="signupPassword" className="auth-label">비밀번호</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            id="signupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder=" "
            className="auth-input"
          />
          <label htmlFor="signupName" className="auth-label">이름</label>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>
      <p className="signup-link">
        이미 계정이 있으신가요? <Link to="/login" className="signup-link-text">로그인</Link>
      </p>
    </div>
  );
}

export default Signup;
