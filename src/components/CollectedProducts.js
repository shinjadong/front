import React, { useState, useEffect } from 'react';
import { getCollectedProducts, batchTaobaoMatch, downloadHeySeller, generateSEO } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/CollectedProducts.css';

function CollectedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    fetchCollectedProducts();
  }, []);

  const fetchCollectedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getCollectedProducts();
      
      if (!result || !result.products) {
        throw new Error('상품 데이터를 불러올 수 없습니다.');
      }

      // 상품 데이터 정규화
      const normalizedProducts = result.products.map(product => ({
        ...product,
        id: product.id || product._id,
        title: product.title || product.product_title,
        image_url: product.image_url || product.imageUrl,
        price: typeof product.price === 'string' ? parseInt(product.price.replace(/[^0-9]/g, '')) : product.price,
        review_count: parseInt(product.review_count || 0),
        purchase_count: parseInt(product.purchase_count || 0),
      }));

      setProducts(normalizedProducts);
      
    } catch (error) {
      console.error('수집된 상품 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaobaoMatch = async () => {
    if (selectedProducts.length === 0) {
      alert('매칭할 상품을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const result = await batchTaobaoMatch(selectedProducts);
      
      if (result && result.matched_products) {
        // 기존 상품 목록 업데이트
        setProducts(prevProducts => {
          const updatedProducts = [...prevProducts];
          result.matched_products.forEach(matchedProduct => {
            const index = updatedProducts.findIndex(p => p.id === matchedProduct.id);
            if (index !== -1) {
              updatedProducts[index] = {
                ...updatedProducts[index],
                ...matchedProduct
              };
            }
          });
          return updatedProducts;
        });
        
        alert('타오바오 매칭이 완료되었습니다.');
      }
    } catch (error) {
      console.error('타오바오 매칭 실패:', error);
      alert(error.response?.data?.error || '타오바오 매칭 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeySellerDownload = async () => {
    if (selectedProducts.length === 0) {
      alert('다운로드할 상품을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await downloadHeySeller(selectedProducts);
      
      // Blob 객체 생성
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heyseller_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('헤이셀러 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('헤이셀러 다운로드 실패:', error);
      alert('헤이셀러 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const filteredProducts = products
    .filter(product => {
      if (filter === 'matched') return product.taobaoMatch;
      if (filter === 'unmatched') return !product.taobaoMatch;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.collection_date) - new Date(a.collection_date);
      }
    });

  const handleGenerateSEO = async (productId) => {
    try {
      setLoading(true);
      const result = await generateSEO(productId);
      
      if (result && result.seo_title) {
        setProducts(prevProducts => {
          const updatedProducts = [...prevProducts];
          const index = updatedProducts.findIndex(p => p.id === productId);
          if (index !== -1) {
            updatedProducts[index] = {
              ...updatedProducts[index],
              seo_title: result.seo_title
            };
          }
          return updatedProducts;
        });
        
        alert('SEO가 성공적으로 생성되었습니다.');
      }
    } catch (error) {
      console.error('SEO 생성 실패:', error);
      alert(error.response?.data?.error || 'SEO 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="상품 정보를 불러오는 중..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="collected-products-container">
      <h2>수집된 상품 ({products.length})</h2>
      
      <div className="controls-bar">
        <div className="action-controls">
          <button 
            className="primary-btn"
            onClick={handleTaobaoMatch}
            disabled={selectedProducts.length === 0}
          >
            타오바오 매칭
          </button>
          <button 
            className="secondary-btn"
            onClick={handleHeySellerDownload}
            disabled={selectedProducts.length === 0}
          >
            헤이셀러 다운로드
          </button>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th><input 
                type="checkbox" 
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts(products.map(p => p.id));
                  } else {
                    setSelectedProducts([]);
                  }
                }}
                checked={selectedProducts.length === products.length}
              /></th>
              <th>이미지</th>
              <th>상품명</th>
              <th>가격</th>
              <th>마켓명</th>
              <th>리뷰수</th>
              <th>구매수</th>
              <th>수집일</th>
              <th>타오바오 매칭</th>
              <th>SEO</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={selectedProducts.includes(product.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                  />
                </td>
                <td>
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="product-thumbnail"
                  />
                </td>
                <td>{product.title}</td>
                <td>{product.price?.toLocaleString()}원</td>
                <td>{product.mall_name}</td>
                <td>{product.review_count?.toLocaleString()}</td>
                <td>{product.purchase_count?.toLocaleString()}</td>
                <td>{new Date(product.collection_date).toLocaleDateString()}</td>
                <td>
                  {product.taobaoMatch ? (
                    <span className="matched">매칭완료</span>
                  ) : (
                    <span className="unmatched">미매칭</span>
                  )}
                </td>
                <td>
                  {product.seo_title ? (
                    <span className="seo-done">완료</span>
                  ) : (
                    <button 
                      onClick={() => handleGenerateSEO(product.id)}
                      className="seo-button"
                    >
                      SEO생성
                    </button>
                  )}
                </td>
                <td>
                  <a 
                    href={product.product_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-button"
                  >
                    보기
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollectedProducts;
