import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';

function Header({ isLoggedIn, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <header className="top-bar">
      <div className="logo">자동AI</div>
      <nav className="main-menu" aria-label="주요 내비게이션">
        <ul>
          <li className="dropdown">
            <button 
              onClick={toggleDropdown}
              className="dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              tabIndex="0"
            >
              <i className="fas fa-box"></i> 소싱 <i className="fas fa-chevron-down dropdown-arrow"></i>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-content" aria-label="소싱 하위 메뉴">
                <li><Link to="/search"><i className="fas fa-robot"></i> AI 소싱</Link></li>
                <li><Link to="/reverse"><i className="fas fa-undo"></i> REVERSE</Link></li>
                <li><Link to="/shipping"><i className="fas fa-truck"></i> 배송대행지</Link></li>
                <li><Link to="/customs"><i className="fas fa-hashtag"></i> 통관번호</Link></li>
                <li><Link to="/exclude"><i className="fas fa-ban"></i> 제외 LIST</Link></li>
              </ul>
            )}
          </li>
          <li className="disabled">
            <button 
              className="not-available" 
              onClick={(e) => e.preventDefault()}
              tabIndex="-1"
            >
              <i className="fas fa-cogs"></i> AI <i className="fas fa-chevron-down dropdown-arrow"></i>
            </button>
            <span className="tooltip">준비중입니다.</span>
          </li>
          <li className="disabled">
            <a href="#" className="not-available" tabIndex="-1">
              <i className="fas fa-chart-line"></i> 마케팅 <i className="fas fa-chevron-down dropdown-arrow"></i>
            </a>
            <span className="tooltip">준비중입니다.</span>
          </li>
          <li className="disabled">
            <a href="#" className="not-available" tabIndex="-1">
              <i className="fas fa-youtube"></i> 유튜브
            </a>
            <span className="tooltip">준비중입니다.</span>
          </li>
          <li className="disabled">
            <a href="#" className="not-available" tabIndex="-1">
              <i className="fas fa-user-tie"></i> 멤버십
            </a>
            <span className="tooltip">준비중입니다.</span>
          </li>
          <li className="disabled">
            <a href="#" className="not-available" tabIndex="-1">
              <i className="fas fa-campground"></i> 레버리지캠프
            </a>
            <span className="tooltip">준비중입니다.</span>
          </li>
        </ul>
      </nav>
      <div className="user-actions">
        <span id="remainingCredits">남은 컨설팅 횟수: 5</span>
        <Link to="/guide" className="guide">가이드</Link>
        <Link to="/settings" className="icon" aria-label="설정"><i className="fas fa-cog"></i></Link>
        <Link to="/notifications" className="icon" aria-label="알림"><i className="fas fa-bell"></i></Link>
        {isLoggedIn && (
          <button onClick={onLogout} className="icon" aria-label="로그아웃">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
