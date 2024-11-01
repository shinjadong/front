import React, { useState, useMemo } from 'react';
import { searchProducts } from '../utils/api';
import ProductList from './ProductList';
import '../styles/SearchPage.css';
import LoadingSpinner from './LoadingSpinner';

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('');

  // 스마트스토어 상품과 일반 상품 분리
  const { smartstoreProducts, otherProducts } = useMemo(() => {
    const products = searchResults?.products || [];
    return {
      smartstoreProducts: products.filter(p => p.is_smartstore) || [],
      otherProducts: products.filter(p => !p.is_smartstore) || []
    };
  }, [searchResults]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setLoadingMessage('상품을 검색하고 있습니다. 잠시만 기다려주세요...');
    setError(null);

    try {
      const result = await searchProducts(keyword);
      if (result && result.products) {
        setSearchResults(result);
      } else {
        throw new Error('검색 결과가 없습니다.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
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

  const handleCollect = async (type) => {
    if (selectedProducts.length === 0) {
      setError('수집할 상품을 선택해주세요.');
      return;
    }

    setLoading(true);
    setLoadingMessage(type === 'market' ? '마켓 정보를 수집하고 있습니다...' : '상품 정보를 수집하고 있습니다...');

    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        throw new Error('로그인이 필요합니다.');
      }

      const selectedItems = searchResults.products.filter(p => 
        selectedProducts.includes(p.id)
      );

      const response = await fetch('http://localhost:5000/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          type,
          selected_items: selectedItems
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setSelectedProducts([]);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="search-page">
      {loading && <LoadingSpinner message={loadingMessage} />}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="results-container">
        {smartstoreProducts.length > 0 && (
          <div className="product-section">
            <h2>스마트스토어 상품 ({smartstoreProducts.length})</h2>
            <ProductList 
              products={smartstoreProducts}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
            />
          </div>
        )}

        {otherProducts.length > 0 && (
          <div className="product-section">
            <h2>일반 상품 ({otherProducts.length})</h2>
            <ProductList 
              products={otherProducts}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
            />
          </div>
        )}

        {!loading && searchResults.products && searchResults.products.length === 0 && (
          <div className="no-results">검색 결과가 없습니다.</div>
        )}
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => handleCollect('market')} 
          disabled={selectedProducts.length === 0}
          className="collect-button"
        >
          마켓 수집
        </button>
        <button 
          onClick={() => handleCollect('product')} 
          disabled={selectedProducts.length === 0}
          className="collect-button"
        >
          상품 수집
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
