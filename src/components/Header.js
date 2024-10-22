import React from 'react';
import { Link } from 'react-router-dom';

function Header({ isLoggedIn, onLogout }) {
  return (
    <header className="top-bar">
      <div className="logo">AI 소싱</div>
      <nav>
        {isLoggedIn ? (
          <button onClick={onLogout}>로그아웃</button>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
