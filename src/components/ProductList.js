import React from 'react';
import '../styles/ProductList.css';

const ProductList = ({ products, selectedProducts, onProductSelect }) => {
  return (
    <div className="product-list">
      <table>
        <thead>
          <tr>
            <th>선택</th>
            <th>이미지</th>
            <th>상품명</th>
            <th>가격</th>
            <th>리뷰수</th>
            <th>구매건수</th>
            <th>마켓명</th>
            <th>링크</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={selectedProducts.includes(product.id) ? 'selected' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onProductSelect(product.id)}
                />
              </td>
              <td>
                <img 
                  src={product.image_url} 
                  alt={product.title} 
                  width="50" 
                  height="50"
                  loading="lazy"
                />
              </td>
              <td>{product.title}</td>
              <td>{product.price.toLocaleString()}원</td>
              <td>{product.review_count}</td>
              <td>{product.purchase_count}</td>
              <td>{product.mall_name}</td>
              <td>
                <a 
                  href={product.product_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="product-link"
                >
                  보기
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList; 