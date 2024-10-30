import React, { useState, useEffect } from 'react';
import { getMarketDB } from '../utils/api';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/MarketManagement.css';

const MarketManagement = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [reversingInProgress, setReversingInProgress] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await getMarketDB(uid);
      setMarkets(response.markets);
    } catch (err) {
      setError(err.message || '마켓 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarketSelect = (marketId) => {
    setSelectedMarkets(prev => {
      if (prev.includes(marketId)) {
        return prev.filter(id => id !== marketId);
      } else {
        return [...prev, marketId];
      }
    });
  };

  const handleMarketReversing = async () => {
    if (selectedMarkets.length === 0) {
      alert('리버싱할 마켓을 선택해주세요.');
      return;
    }

    setReversingInProgress(true);
    try {
      const uid = localStorage.getItem('uid');
      const response = await api.post('/market_reversing', {
        uid,
        marketIds: selectedMarkets
      });

      if (response.data.products) {
        alert(`${response.data.products.length}개의 상품이 수집되었습니다.`);
        window.location.href = '/collected';
      } else {
        alert('수집된 상품이 없습니다.');
      }
    } catch (error) {
      console.error('마켓 리버싱 실패:', error);
      alert(error.response?.data?.error || '마켓 리버싱 중 오류가 발생했습니다.');
    } finally {
      setReversingInProgress(false);
    }
  };

  if (loading) return <LoadingSpinner message="마켓 정보를 불러오고 있습니다..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="market-management">
      <h2>수집된 마켓 목록</h2>
      <div className="action-buttons">
        <button 
          onClick={handleMarketReversing}
          disabled={selectedMarkets.length === 0 || reversingInProgress}
          className="reversing-button"
        >
          {reversingInProgress ? '리버싱 중...' : '마켓 리버싱'}
        </button>
      </div>
      <div className="markets-grid">
        {markets.map((market, index) => (
          <div key={index} className="market-card">
            <input
              type="checkbox"
              checked={selectedMarkets.includes(market.mallName)}
              onChange={() => handleMarketSelect(market.mallName)}
            />
            <h3>{market.mallName}</h3>
            <div className="market-info">
              <p><strong>등급:</strong> {market.mallGrade || '정보 없음'}</p>
              <p><strong>상품 수:</strong> {market.productCount || 0}</p>
              <p><strong>최근 업데이트:</strong> {new Date(market.lastUpdated).toLocaleDateString()}</p>
            </div>
            <a 
              href={market.mallUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="visit-button"
            >
              마켓 방문
            </a>
          </div>
        ))}
      </div>
      {markets.length === 0 && (
        <div className="no-markets">
          수집된 마켓이 없습니다.
        </div>
      )}
    </div>
  );
};

export default MarketManagement; 