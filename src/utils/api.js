import axios from 'axios';

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
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await api.post('/refresh_token', {
                    uid: localStorage.getItem('uid'),
                    refresh_token: refreshToken
                });
                
                const { token, newRefreshToken } = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                
                return api(originalRequest);
            } catch (refreshError) {
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

// 인증 관련 API
export const signup = async (email, password, name) => {
    try {
        const response = await api.post('/signup', { email, password, name });
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
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
        console.error('Login error:', error);
        throw error;
    }
};

export const getUserInfo = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/user-info?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error('Get user info error:', error);
        throw error;
    }
};

// 통합된 collectProducts 함수
export const collectProducts = async (uid, productIds, type = 'market') => {
    try {
        const endpoint = type === 'market' ? '/collect_selected_products' : '/collect';
        const response = await api.post(endpoint, {
            uid,
            product_ids: productIds,
            type
        });
        return response.data;
    } catch (error) {
        console.error('Collect products error:', error);
        throw error;
    }
};

// 마켓 관련 API
export const getMarketDB = async (uid) => {
    try {
        const response = await api.get(`/get_market_db?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error('Get market DB error:', error);
        throw error;
    }
};

export const addMarket = async (uid, marketData) => {
    try {
        const response = await api.post('/add_market', { uid, marketData });
        return response.data;
    } catch (error) {
        console.error('Add market error:', error);
        throw error;
    }
};

export const updateMarket = async (uid, marketId, marketData) => {
    try {
        const response = await api.put('/update_market', { uid, marketId, marketData });
        return response.data;
    } catch (error) {
        console.error('Update market error:', error);
        throw error;
    }
};

export const deleteMarket = async (uid, marketId) => {
    try {
        const response = await api.delete('/delete_market', { data: { uid, marketId } });
        return response.data;
    } catch (error) {
        console.error('Delete market error:', error);
        throw error;
    }
};

export const reverseMarket = async (uid, marketId) => {
    try {
        const response = await api.post('/market_reversing', { uid, marketIds: [marketId] });
        return response.data;
    } catch (error) {
        console.error('Reverse market error:', error);
        throw error;
    }
};

// 기타 API 함수들...
export const searchProducts = async (keyword) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/search', { keyword, uid });
        return response.data;
    } catch (error) {
        console.error('Search products error:', error);
        throw error;
    }
};

export const getCollectedProducts = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/get_collected_products?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error('Get collected products error:', error);
        throw error;
    }
};

export const matchTaobaoProduct = async (imageUrl) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/taobao_match', { image_url: imageUrl, uid });
        return response.data;
    } catch (error) {
        console.error('Taobao match error:', error);
        throw error;
    }
};

export const batchTaobaoMatch = async (productIds) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/batch_taobao_match', { uid, productIds });
        return response.data;
    } catch (error) {
        console.error('Batch taobao match error:', error);
        throw error;
    }
};

export const downloadHeySeller = async () => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.get(`/download_heyseller?uid=${uid}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Download heyseller error:', error);
        throw error;
    }
};

export const generateSEO = async (productId) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/generate_seo', { uid, product_id: productId });
        return response.data;
    } catch (error) {
        console.error('Generate SEO error:', error);
        throw error;
    }
};

export default api;
