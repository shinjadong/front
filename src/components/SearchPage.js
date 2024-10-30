import React, { useState, useMemo } from 'react';
import { searchProducts, collectProducts } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/main.css';

function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) {
      alert('키워드를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await searchProducts(keyword);
      setSearchResults(result.products);
    } catch (error) {
      console.error('검색 실패:', error);
      alert(error.response?.data?.error || '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectProducts = async () => {
    if (selectedProductIds.length === 0) {
      alert('수집할 상품을 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      const response = await collectProducts(selectedProductIds);
      alert(response.message);
      setSelectedProductIds([]);
    } catch (error) {
      console.error('상품 수집 실패:', error);
      alert(error.response?.data?.error || '상품 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = products.map(product => product.id);
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds([]);
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const products = useMemo(() => {
    return searchResults.filter(product => {
      // 여기에 필터링 로직 추가
      return true; // 현재는 모든 상품을 반환
    });
  }, [searchResults]);

  return (
    <div className="search-page">
      {loading && <LoadingSpinner />}
      <h2>상품 검색</h2>
      <form onSubmit={handleSearch} className="search-container">
        <div className="search-bar">
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드를 입력하세요" 
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '검색 중...' : <i className="fas fa-search"></i>}
          </button>
        </div>
      </form>

      {products.length > 0 && (
        <div className="search-results">
          <div className="table-actions">
            <button onClick={handleCollectProducts} className="collect-button" disabled={loading}>
              {loading ? '수집 중...' : '선택한 상품 수집'}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={selectedProductIds.length === products.length}
                    aria-label="모두 선택"
                  />
                </th>
                <th>이미지</th>
                <th>상품명</th>
                <th>가격</th>
                <th>마켓명</th>
                <th>리뷰수</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      aria-label={`상품 ${product.product_title} 선택`}
                    />
                  </td>
                  <td><img src={product.image_url} alt={product.product_title} width="50" /></td>
                  <td>{product.product_title}</td>
                  <td>{product.price.toLocaleString()}원</td>
                  <td>{product.market_name}</td>
                  <td>{product.review_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
