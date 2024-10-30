import React, { useState, useEffect } from 'react';
import { getMarketDB, addMarket, deleteMarket, updateMarket, reverseMarket, collectProducts } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/MarketManagement.css';

const MarketManagement = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMarket, setNewMarket] = useState({ mallName: '', mallUrl: '' });
  const [editingMarket, setEditingMarket] = useState(null);
  const [scrapingResults, setScrapingResults] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // 마켓 데이터 로드
  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const uid = localStorage.getItem('uid');
      const response = await getMarketDB(uid);
      setMarkets(response.markets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 마켓 추가
  const handleAddMarket = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const uid = localStorage.getItem('uid');
      await addMarket(uid, newMarket);
      setShowAddForm(false);
      setNewMarket({ mallName: '', mallUrl: '' });
      await fetchMarkets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 마켓 수정
  const handleUpdateMarket = async (marketId) => {
    try {
      setLoading(true);
      const uid = localStorage.getItem('uid');
      await updateMarket(uid, marketId, editingMarket);
      setEditingMarket(null);
      await fetchMarkets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 마켓 삭제
  const handleDeleteMarket = async (marketId) => {
    if (window.confirm('정말 이 마켓을 삭제하시겠습니까?')) {
      try {
        setLoading(true);
        const uid = localStorage.getItem('uid');
        await deleteMarket(uid, marketId);
        await fetchMarkets();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 마켓 리버싱
  const handleReverseMarket = async (marketId) => {
    try {
      setLoading(true);
      const uid = localStorage.getItem('uid');
      const result = await reverseMarket(uid, marketId);
      setScrapingResults(result.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 상품 선택 처리
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // 선택된 상품 수집
  const handleCollectProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('수집할 상품을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const uid = localStorage.getItem('uid');
      await collectProducts(uid, selectedProducts, 'market');
      alert('선택한 상품이 수집되었습니다.');
      setScrapingResults(null);
      setSelectedProducts([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-management">
      {loading && <LoadingSpinner />}
      
      <div className="market-controls">
        <button onClick={() => setShowAddForm(true)} className="add-market-btn">
          마켓 추가
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMarket} className="market-form">
          <input
            type="text"
            placeholder="마켓명"
            value={newMarket.mallName}
            onChange={(e) => setNewMarket({...newMarket, mallName: e.target.value})}
          />
          <input
            type="text"
            placeholder="마켓 URL"
            value={newMarket.mallUrl}
            onChange={(e) => setNewMarket({...newMarket, mallUrl: e.target.value})}
          />
          <button type="submit">추가</button>
          <button type="button" onClick={() => setShowAddForm(false)}>취소</button>
        </form>
      )}

      <div className="markets-grid">
        {markets.map(market => (
          <div key={market.mallName} className="market-card">
            {editingMarket?.mallName === market.mallName ? (
              <div className="edit-form">
                <input
                  value={editingMarket.mallName}
                  onChange={(e) => setEditingMarket({...editingMarket, mallName: e.target.value})}
                />
                <input
                  value={editingMarket.mallUrl}
                  onChange={(e) => setEditingMarket({...editingMarket, mallUrl: e.target.value})}
                />
                <button onClick={() => handleUpdateMarket(market.mallName)}>저장</button>
                <button onClick={() => setEditingMarket(null)}>취소</button>
              </div>
            ) : (
              <>
                <div className="market-info">
                  <h3>{market.mallName}</h3>
                  <p>등급: {market.mallGrade}</p>
                  <p>관심고객: {market.customerCount}</p>
                  <p>성별비율: 남성 {market.genderRatio?.male}% / 여성 {market.genderRatio?.female}%</p>
                  <div className="age-groups">
                    <h4>연령대 분포</h4>
                    {Object.entries(market.ageGroups || {}).map(([age, percentage]) => (
                      <div key={age} className="age-bar">
                        <span>{age}대</span>
                        <div className="bar" style={{width: `${percentage}%`}}></div>
                        <span>{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="market-actions">
                  <button onClick={() => setEditingMarket(market)}>수정</button>
                  <button onClick={() => handleDeleteMarket(market.mallName)}>삭제</button>
                  <button onClick={() => handleReverseMarket(market.mallName)}>리버싱</button>
                  <a href={market.mallUrl} target="_blank" rel="noopener noreferrer">방문</a>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {scrapingResults && (
        <div className="scraping-results">
          <h3>스크래핑 결과</h3>
          <div className="results-controls">
            <button 
              onClick={handleCollectProducts}
              disabled={selectedProducts.length === 0}
            >
              선택 상품 수집
            </button>
          </div>
          <div className="products-grid">
            {scrapingResults.map(product => (
              <div 
                key={product.id} 
                className={`product-card ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleProductSelect(product.id)}
                />
                <img src={product.image_url} alt={product.title} />
                <h4>{product.title}</h4>
                <p className="price">{product.price.toLocaleString()}원</p>
                <div className="stats">
                  <span>리뷰 {product.review_count}</span>
                  <span>구매 {product.purchase_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MarketManagement;