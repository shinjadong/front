import React, { useState } from 'react';
import { collectProducts } from '../utils/api';
import '../styles/ScrapingResults.css';

const ScrapingResults = ({ products, onBack }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [collecting, setCollecting] = useState(false);

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleCollectSelected = async () => {
    if (selectedProducts.length === 0) {
      alert('수집할 상품을 선택해주세요.');
      return;
    }

    setCollecting(true);
    try {
      const uid = localStorage.getItem('uid');
      await collectProducts(uid, selectedProducts);
      alert('선택한 상품이 수집되었습니다.');
      window.location.href = '/collected';
    } catch (error) {
      console.error('상품 수집 실패:', error);
      alert('상품 수집 중 오류가 발생했습니다.');
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="scraping-results">
      <div className="header">
        <button onClick={onBack} className="back-button">
          <i className="fas fa-arrow-left"></i> 마켓 목록으로
        </button>
        <h2>스크래핑 결과</h2>
        <button 
          onClick={handleCollectSelected}
          disabled={selectedProducts.length === 0 || collecting}
          className="collect-button"
        >
          {collecting ? '수집 중...' : '선택 상품 수집'}
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className={`product-card ${selectedProducts.includes(product.id) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductSelect(product.id)}
            />
            <img src={product.image_url} alt={product.title} />
            <h3>{product.title}</h3>
            <p className="price">{product.price.toLocaleString()}원</p>
            <div className="stats">
              <span>리뷰 {product.review_count}</span>
              <span>구매 {product.purchase_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrapingResults; 