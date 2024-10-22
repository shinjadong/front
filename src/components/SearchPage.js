import React, { useState } from 'react';
import { searchProducts, collectProducts } from '../utils/api';

function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const result = await searchProducts(keyword);
      setProducts(result.products);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  const handleCollectProducts = async () => {
    try {
      await collectProducts(selectedProductIds);
      alert('선택한 상품이 성공적으로 수집되었습니다.');
      setSelectedProductIds([]);
    } catch (error) {
      console.error('상품 수집 실패:', error);
      if (error.response) {
        alert(`상품 수집 실패: ${error.response.data.message || '서버 오류가 발생했습니다.'}`);
      } else if (error.request) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        alert('상품 수집 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="search-page">
      <h2>상품 검색</h2>
      <form onSubmit={handleSearch} className="search-container">
        <div className="search-bar">
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드를 입력하세요" 
          />
          <button type="submit" className="search-button">검색</button>
        </div>
      </form>

      {products.length > 0 && (
        <div className="search-results">
          <h3>검색 결과</h3>
          <button onClick={handleCollectProducts} className="collect-button">선택한 상품 수집</button>
          <table>
            <thead>
              <tr>
                <th>선택</th>
                <th>이미지</th>
                <th>상품명</th>
                <th>가격</th>
                <th>마켓명</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => {
                        setSelectedProductIds(prev => 
                          prev.includes(product.id)
                            ? prev.filter(id => id !== product.id)
                            : [...prev, product.id]
                        );
                      }}
                    />
                  </td>
                  <td><img src={product.image_url} alt={product.product_title} width="50" /></td>
                  <td>{product.product_title}</td>
                  <td>{product.price}</td>
                  <td>{product.market_name}</td>
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
