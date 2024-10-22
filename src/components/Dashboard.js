import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error('Failed to parse userInfo:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  if (!userInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>환영합니다, <span className="user-name">{userInfo.name}</span>님!</h2>
        <p>멤버십 레벨: <span className="membership-level">{userInfo.membershipLevel}</span></p>
      </div>
      <div className="quick-actions">
        <h3>빠른 작업</h3>
        <div className="action-buttons">
          <Link to="/search" className="action-button">
            <i className="fas fa-search"></i>
            상품 검색
          </Link>
          <Link to="/collected" className="action-button">
            <i className="fas fa-list"></i>
            수집된 상품
          </Link>
          <Link to="/taobao-match" className="action-button">
            <i className="fas fa-link"></i>
            타오바오 매칭
          </Link>
        </div>
      </div>
      {/* 여기에 추가적인 대시보드 내용을 넣을 수 있습니다 */}
    </div>
  );
}

export default Dashboard;
