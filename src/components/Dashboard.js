import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error('Failed to parse userInfo:', error);
        // 파싱 실패 시 localStorage에서 userInfo 제거
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  if (!userInfo) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="dashboard">
      <div className="user-info">
        <span id="userName">{userInfo.name}</span>님, 환영합니다!
        (멤버십 레벨: <span id="membershipLevel">{userInfo.membershipLevel}</span>)
      </div>
      {/* 대시보드 내용 */}
    </div>
  );
}

export default Dashboard;
