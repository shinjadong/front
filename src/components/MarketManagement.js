import React, { useState, useEffect } from 'react';
import { getMarketDB } from '../utils/api';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import ScrapingResults from './ScrapingResults';
import SellerInfo from './SellerInfo';
import '../styles/MarketManagement.css';

const MarketManagement = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [reversingInProgress, setReversingInProgress] = useState(false);
  const [scrapedProducts, setScrapedProducts] = useState([]);
  const [showScrapingResults, setShowScrapingResults] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchMarketsWithRetry = async () => {
      try {
        setLoading(true);
        const uid = localStorage.getItem('uid');
        if (!uid) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await getMarketDB(uid);
        if (response.markets) {
          setMarkets(response.markets);
          setLoading(false);
        } else {
          throw new Error('마켓 데이터가 없습니다.');
        }
      } catch (err) {
        console.error('마켓 정보 로딩 실패:', err);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000); // 2초 후 재시도
        } else {
          setError(err.message || '마켓 정보를 불러오는데 실패했습니다.');
          setLoading(false);
        }
      }
    };

    fetchMarketsWithRetry();
  }, [retryCount]);

  const handleMarketSelect = (marketId) => {
    setSelectedMarkets(prev => {
      if (prev.includes(marketId)) {
        return prev.filter(id => id !== marketId);
      } else {
        return [...prev, marketId];
      }
    });
  };

  const handleMarketClick = (marketId) => {
    setSelectedMarketId(marketId === selectedMarketId ? null : marketId);
  };

  const handleCollectSelected = async (selectedProductIds) => {
    if (!selectedProductIds.length) {
      alert('수집할 상품을 선택해주세요.');
      return;
    }

    try {
      const uid = localStorage.getItem('uid');
      await api.post('/collect', {
        uid,
        type: 'product',
        selected_items: scrapedProducts.filter(p => selectedProductIds.includes(p.id))
      });
      alert('선택한 상품이 수집되었습니다.');
      window.location.href = '/collected';
    } catch (error) {
      console.error('상품 수집 실패:', error);
      alert(error.response?.data?.error || '상품 수집 중 오류가 발생했습니다.');
    }
  };

  const handleMarketReversing = async () => {
    if (selectedMarkets.length === 0) {
      alert('리버싱할 마켓을 선택해주세요.');
      return;
    }

    setReversingInProgress(true);
    setLoading(true);
    try {
      const uid = localStorage.getItem('uid');
      const response = await api.post('/market_reversing', {
        uid,
        marketIds: selectedMarkets
      });

      if (response.data.products) {
        setScrapedProducts(response.data.products);
        setShowScrapingResults(true);
        
        if (response.data.market_data) {
          setMarketData(response.data.market_data);
        }
      }
    } catch (error) {
      console.error('마켓 리버싱 실패:', error);
      alert(error.response?.data?.error || '마켓 리버싱 중 오류가 발생했습니다.');
    } finally {
      setReversingInProgress(false);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="마켓 정보를 불러오고 있습니다..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="market-management">
      {loading && <LoadingSpinner message="마켓 데이터를 수집하고 있습니다..." />}
      
      {!showScrapingResults ? (
        <>
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
                <div className="market-header">
                  <input
                    type="checkbox"
                    checked={selectedMarkets.includes(market.mallName)}
                    onChange={() => handleMarketSelect(market.mallName)}
                  />
                  <h3 onClick={() => handleMarketClick(market.mallName)}>
                    {market.mallName}
                  </h3>
                </div>
                <div className="market-info">
                  <p><strong>등급:</strong> {market.mallGrade || '정보 없음'}</p>
                  <p><strong>상품 수:</strong> {market.productCount || 0}</p>
                  <p><strong>최근 업데이트:</strong> {new Date(market.lastUpdated).toLocaleDateString()}</p>
                </div>
                {selectedMarketId === market.mallName && (
                  <SellerInfo marketId={market.mallName} />
                )}
                <div className="market-actions">
                  <a 
                    href={market.mallUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="visit-button"
                  >
                    마켓 방문
                  </a>
                </div>
              </div>
            ))}
          </div>
          {markets.length === 0 && (
            <div className="no-markets">
              수집된 마켓이 없습니다.
            </div>
          )}
        </>
      ) : (
        <ScrapingResults 
          products={scrapedProducts}
          onCollectSelected={handleCollectSelected}
          onBack={() => setShowScrapingResults(false)}
        />
      )}
    </div>
  );
};

export default MarketManagement;