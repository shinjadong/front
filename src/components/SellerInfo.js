import React, { useState, useEffect } from 'react';
import { getSellerInfo } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/SellerInfo.css';

const SellerInfo = ({ marketId }) => {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (marketId) {
      fetchSellerInfo();
    }
  }, [marketId, fetchSellerInfo]);

  const fetchSellerInfo = async () => {
    try {
      const uid = localStorage.getItem('uid');
      const response = await getSellerInfo(uid, marketId);
      setSellerInfo(response.data);
    } catch (err) {
      setError(err.message || '판매자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="판매자 정보를 불러오고 있습니다..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!sellerInfo) return <div>판매자 정보가 없습니다.</div>;

  return (
    <div className="seller-info">
      <h3>판매자 정보</h3>
      <div className="info-grid">
        <div className="info-item">
          <label>마켓 등급</label>
          <span>{sellerInfo.grade || '정보 없음'}</span>
        </div>
        <div className="info-item">
          <label>관심 고객수</label>
          <span>{sellerInfo.customerCount || '0'}</span>
        </div>
        <div className="info-item">
          <label>성별 비율</label>
          <div className="gender-ratio">
            <div className="male" style={{width: `${sellerInfo.maleRatio}%`}}>
              남성 {sellerInfo.maleRatio}%
            </div>
            <div className="female" style={{width: `${sellerInfo.femaleRatio}%`}}>
              여성 {sellerInfo.femaleRatio}%
            </div>
          </div>
        </div>
        <div className="info-item">
          <label>연령대 분포</label>
          <div className="age-distribution">
            {Object.entries(sellerInfo.ageGroups).map(([age, ratio]) => (
              <div key={age} className="age-bar">
                <span className="age-label">{age}대</span>
                <div className="bar" style={{height: `${ratio}%`}}></div>
                <span className="ratio">{ratio}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="info-item">
          <label>인기 연령대</label>
          <span>{sellerInfo.topAgeGroups.join(', ')}</span>
        </div>
        <div className="info-item">
          <label>연관 채널</label>
          <div className="social-links">
            {sellerInfo.blogUrl && (
              <a href={sellerInfo.blogUrl} target="_blank" rel="noopener noreferrer">
                <i className="fas fa-blog"></i> 블로그
              </a>
            )}
            {sellerInfo.instagramUrl && (
              <a href={sellerInfo.instagramUrl} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i> 인스타그램
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo; 