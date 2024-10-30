import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>환영합니다, <span className="user-name">홍길동</span>님!</h2>
        <p>멤버십 레벨: <span className="membership-level">Premium</span></p>
      </div>
      <div className="quick-actions">
        <h3>빠른 작업</h3>
        <div className="action-buttons">
          <Link to="/search" className="action-button">
            <i className="fas fa-search"></i>
            <span>상품 검색</span>
          </Link>
          <Link to="/collected" className="action-button">
            <i className="fas fa-list"></i>
            <span>수집된 상품</span>
          </Link>
          <Link to="/taobao-match" className="action-button">
            <i className="fas fa-link"></i>
            <span>타오바오 매칭</span>
          </Link>
        </div>
      </div>
      {/* 추가적인 대시보드 내용을 여기에 추가할 수 있습니다 */}
    </div>
  );
}

export default Dashboard;
