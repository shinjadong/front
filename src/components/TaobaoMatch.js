import React, { useState } from 'react';
import { matchTaobaoProduct } from '../utils/api';

function TaobaoMatch() {
  const [imageUrl, setImageUrl] = useState('');
  const [matchResult, setMatchResult] = useState(null);

  const handleMatch = async () => {
    try {
      const result = await matchTaobaoProduct(imageUrl);
      setMatchResult(result);
    } catch (error) {
      console.error('타오바오 매칭 실패:', error);
      alert('타오바오 매칭에 실패했습니다.');
    }
  };

  return (
    <div className="taobao-match">
      <h2>타오바오 매칭</h2>
      <div className="match-input">
        <input 
          type="text" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="이미지 URL 입력"
        />
        <button onClick={handleMatch}>매칭</button>
      </div>
      {matchResult && (
        <div className="match-result">
          <h3>매칭 결과:</h3>
          <p>상품명: {matchResult.title}</p>
          <p>가격: {matchResult.price}</p>
          <p>상점명: {matchResult.shopName}</p>
          <img src={matchResult.mainImageUrl} alt="매칭된 상품" width="200" />
        </div>
      )}
    </div>
  );
}

export default TaobaoMatch;
