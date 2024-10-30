import axios from 'axios';

// 고정 ngrok URL 사용
const API_BASE_URL = 'https://moray-leading-jolly.ngrok-free.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 요청 인터셉터에서 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (uid) {
            // URL에 uid가 없는 경우에만 추가
            if (!config.url.includes('uid=')) {
                config.url += (config.url.includes('?') ? '&' : '?') + `uid=${uid}`;
            }
        }
        
        config.withCredentials = false;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터에서 토큰 만료 처리
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // 토큰 만료 에러인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // 로컬 스토리지에서 리프레시 토큰 가져오기
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await api.post('/refresh_token', {
                    uid: localStorage.getItem('uid'),
                    refresh_token: refreshToken
                });
                
                const { token, newRefreshToken } = response.data;
                
                // 새 토큰 저장
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                // 헤더 업데이트
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                
                return api(originalRequest);
            } catch (refreshError) {
                // 리프레시 실패 시 자동 로그인 시도
                try {
                    const savedCredentials = JSON.parse(localStorage.getItem('userCredentials'));
                    if (savedCredentials) {
                        const loginResponse = await api.post('/login', savedCredentials);
                        const { token, refreshToken } = loginResponse.data;
                        
                        localStorage.setItem('token', token);
                        localStorage.setItem('refreshToken', refreshToken);
                        
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        
                        return api(originalRequest);
                    }
                } catch (loginError) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        config.withCredentials = false;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 기본 API 함수들
export const signup = async (email, password, name) => {
    try {
        console.log('Sending signup request to:', API_BASE_URL + '/signup');
        console.log('Request data:', { email, name });
        
        const response = await api.post('/signup', {
            email,
            password,
            name
        });
        
        console.log('Signup response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Signup error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });
        const { token, refreshToken, uid } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('uid', uid);
        localStorage.setItem('userCredentials', JSON.stringify({ email, password }));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response || error);
        throw error;
    }
};

export const getUserInfo = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/user-info?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error('Get user info error:', error.response || error);
        throw error;
    }
};

// 검색 및 수집 관련 API
export const searchProducts = async (keyword, uid) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/search`, {
            keyword,
            uid
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error.response?.data || error;
    }
};

export const collectProducts = async (selectedProductIds) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/collect', {
            uid,
            selected_product_ids: selectedProductIds
        });
        return response.data;
    } catch (error) {
        console.error('Collect products error:', error.response || error);
        throw error;
    }
};

// 수집된 상품 관련 API
export const getCollectedProducts = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/get_collected_products?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error('Get collected products error:', error.response || error);
        throw error;
    }
};

// 타오바오 관련 API
export const matchTaobaoProduct = async (imageUrl) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/taobao_match', { image_url: imageUrl, uid });
        return response.data;
    } catch (error) {
        console.error('Taobao match error:', error.response || error);
        throw error;
    }
};

export const batchTaobaoMatch = async (productIds) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/batch_taobao_match', { uid, productIds });
        return response.data;
    } catch (error) {
        console.error('Batch taobao match error:', error.response || error);
        throw error;
    }
};

// 헤이셀러 관련 API
export const downloadHeySeller = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/download_heyseller?uid=${uid}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Download heyseller error:', error.response || error);
        throw error;
    }
};

// SEO 관련 API
export const generateSEO = async (productId) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/generate_seo', { uid, product_id: productId });
        return response.data;
    } catch (error) {
        console.error('Generate SEO error:', error.response || error);
        throw error;
    }
};

// 마켓 DB 조회
export const getMarketDB = async (uid) => {
  try {
    const response = await api.get(`/get_market_db?uid=${uid}`);
    return response.data;
  } catch (error) {
    console.error('Get market DB error:', error.response || error);
    throw error;
  }
};

// getSellerInfo 함수 추가
export const getSellerInfo = async (uid, marketId) => {
  try {
    const response = await api.get(`/get_seller_info?uid=${uid}&market_id=${marketId}`);
    return response.data;
  } catch (error) {
    console.error('Get seller info error:', error.response || error);
    throw error;
  }
};

// 마켓 리버싱 관련 API 함수 추가
export const getMarketScrapingResults = async (uid) => {
  try {
    const response = await api.get(`/get_scraping_results?uid=${uid}`);
    return response.data;
  } catch (error) {
    console.error('Get market scraping results error:', error.response || error);
    throw error;
  }
};

export const collectSelectedProducts = async (uid, selectedProductIds) => {
  try {
    const response = await api.post('/collect_selected_products', {
      uid,
      product_ids: selectedProductIds
    });
    return response.data;
  } catch (error) {
    console.error('Collect selected products error:', error.response || error);
    throw error;
  }
};

export default api;
