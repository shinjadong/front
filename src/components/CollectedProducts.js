import React, { useEffect, useState } from 'react';
import { getCollectedProducts, batchTaobaoMatch, downloadHeySeller, generateSEO } from '../utils/api';
import '../styles/main.css';

function CollectedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchCollectedProducts();
  }, []);

  const fetchCollectedProducts = async () => {
    try {
      setLoading(true);
      const result = await getCollectedProducts();
      setProducts(result.products);
      setLoading(false);
    } catch (error) {
      console.error('수집된 상품 조회 실패:', error);
      setError(error.response?.data?.error || '수집된 상품을 불러오는 데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleTaobaoMatch = async () => {
    if (selectedProducts.length === 0) {
      alert('매칭할 상품을 선택해주세요.');
      return;
    }

    try {
      const result = await batchTaobaoMatch(selectedProducts);
      setProducts(result.matched_products);
      alert('타오바오 매칭이 완료되었습니다.');
    } catch (error) {
      console.error('타오바오 매칭 실패:', error);
      alert('타오바오 매칭 중 오류가 발생했습니다.');
    }
  };

  const handleHeySellerDownload = async () => {
    if (selectedProducts.length === 0) {
      alert('다운로드할 상품을 선택해주세요.');
      return;
    }

    try {
      const blob = await downloadHeySeller(selectedProducts);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'heyseller_products.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert('헤이셀러 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('헤이셀러 다운로드 실패:', error);
      alert(error.response?.data?.error || '헤이셀러 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleGenerateSEO = async (productId) => {
    if (!selectedProducts.includes(productId)) {
      alert('SEO를 생성할 상품을 선택해주세요.');
      return;
    }

    try {
      const result = await generateSEO(productId);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, ...result } : product
        )
      );
      alert('SEO 최적화가 완료되었습니다.');
    } catch (error) {
      console.error('SEO 생성 실패:', error);
      alert(`SEO 생성 중 오류 발생: ${error.response?.data?.error || error.message}`);
    }
  };

  const getTaobaoUrl = (product) => {
    const taobaoId = product.taobaoMatch?.itemId;
    return taobaoId ? `https://item.taobao.com/item.htm?id=${taobaoId}` : '#';
  };

  // 이미지 URL 처리 함수 추가
  const getImageUrl = (url) => {
    if (!url) return '';
    // 이미지 URL이 상대 경로인 경우 전체 URL로 변환
    if (url.startsWith('/')) {
      return `https://shopping.naver.com${url}`;
    }
    return url;
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="collected-products">
      <h2>수집된 상품</h2>
      <div className="action-buttons">
        <button 
          onClick={handleTaobaoMatch} 
          className="collect-button" 
          disabled={selectedProducts.length === 0}
        >
          타오바오 매칭
        </button>
        <button 
          onClick={handleHeySellerDownload} 
          className="collect-button" 
          disabled={selectedProducts.length === 0}
        >
          헤이셀러 다운로드
        </button>
        <button onClick={() => setShowCategories(!showCategories)} className="toggle-categories-button">
          {showCategories ? '카테고리 숨기기' : '카테고리 보기'}
        </button>
      </div>
      {products.length > 0 ? (
        <table className="collected-products-table">
          <thead>
            <tr>
              <th>선택</th>
              <th>이미지</th>
              <th>상품명</th>
              <th>가격</th>
              <th>타오바오 이미지</th>
              <th>타오바오 상품명</th>
              <th>타오바오 가격</th>
              <th>타오바오 링크</th>
              {showCategories && <th>카테고리</th>}
              <th>SEO 최적화 상품명</th>
              <th>SEO 액션</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                  />
                </td>
                <td>
                  <img 
                    src={getImageUrl(product.image_url)} 
                    alt={product.title} 
                    width="50" 
                    height="50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png'; // 기본 이미지
                    }}
                    loading="lazy"
                  />
                </td>
                <td>{product.product_title}</td>
                <td>{product.price.toLocaleString()}원</td>
                <td>
                  {product.taobaoMatch && (
                    <img src={product.taobaoMatch.mainImageUrl} alt={product.taobaoMatch.title} width="50" />
                  )}
                </td>
                <td>{product.taobaoMatch ? product.taobaoMatch.title : '매칭 안됨'}</td>
                <td>{product.taobaoMatch ? `${product.taobaoMatch.price.toLocaleString()}원` : '매칭 안됨'}</td>
                <td>
                  {product.taobaoMatch ? (
                    <a href={getTaobaoUrl(product)} target="_blank" rel="noopener noreferrer" className="taobao-link">
                      타오바오 링크
                    </a>
                  ) : '매칭 안됨'}
                </td>
                {showCategories && <td>{product.category || '카테고리 없음'}</td>}
                <td>{product.seo_title || '미생성'}</td>
                <td>
                  <button 
                    onClick={() => handleGenerateSEO(product.id)} 
                    className="seo-button"
                    disabled={!selectedProducts.includes(product.id)}
                  >
                    SEO {product.seo_title ? '재생성' : '생성'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>수집된 상품이 없습니다.</p>
      )}
    </div>
  );
}

export default CollectedProducts;
