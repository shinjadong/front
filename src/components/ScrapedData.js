import React, { useState, useEffect } from 'react';
import { getScrapedData } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/ScrapedData.css';

const ScrapedData = () => {
  const [scrapedData, setScrapedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchScrapedData();
  }, []);

  const fetchScrapedData = async () => {
    try {
      const uid = localStorage.getItem('uid');
      const response = await getScrapedData(uid);
      setScrapedData(response.data);
    } catch (err) {
      setError(err.message || '수집된 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = scrapedData.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price;
      case 'reviews':
        return b.review_count - a.review_count;
      case 'purchases':
        return b.purchase_count - a.purchase_count;
      default:
        return new Date(b.collection_date) - new Date(a.collection_date);
    }
  });

  if (loading) return <LoadingSpinner message="수집된 데이터를 불러오고 있습니다..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="scraped-data">
      <div className="controls">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="product">상품</option>
          <option value="market">마켓</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">최신순</option>
          <option value="price">가격순</option>
          <option value="reviews">리뷰순</option>
          <option value="purchases">구매순</option>
        </select>
      </div>
      <div className="data-grid">
        {sortedData.map(item => (
          <div key={item.id} className="data-card">
            <img src={item.image_url} alt={item.title} />
            <h4>{item.title}</h4>
            <p className="price">{item.price.toLocaleString()}원</p>
            <div className="stats">
              <span>리뷰 {item.review_count}</span>
              <span>구매 {item.purchase_count}</span>
            </div>
            <div className="collection-info">
              <span>{new Date(item.collection_date).toLocaleDateString()}</span>
              <span>{item.type === 'market' ? '마켓' : '상품'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrapedData; 