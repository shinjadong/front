import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development' 
        ? '/api' 
        : process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
    withCredentials: true
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const uid = localStorage.getItem('uid');
        if (uid && !config.url.includes('uid=')) {
            const separator = config.url.includes('?') ? '&' : '?';
            config.url = `${config.url}${separator}uid=${uid}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // 토큰 갱신 로직
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await api.post('/refresh_token', { refresh_token: refreshToken });
                    localStorage.setItem('token', response.data.token);
                    error.config.headers['Authorization'] = `Bearer ${response.data.token}`;
                    return api(error.config);
                }
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// 인증 관련 API
export const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const signup = async (email, password, name) => {
    const response = await api.post('/signup', { email, password, name });
    return response.data;
};

// 상품 검색 및 수집 API
export const searchProducts = async (keyword) => {
    const uid = localStorage.getItem('uid');
    const response = await api.post('/search', { keyword, uid });
    return response.data;
};

export const collectProducts = async (uid, selected_items) => {
    const response = await api.post('/collect', { uid, selected_items });
    return response.data;
};

export const getCollectedProducts = async () => {
    const uid = localStorage.getItem('uid');
    const response = await api.get(`/get_collected_products?uid=${uid}`);
    return response.data;
};

// 타오바오 매칭 API
export const matchTaobaoProduct = async (imageUrl) => {
    const response = await api.post('/taobao_match', { image_url: imageUrl });
    return response.data;
};

export const batchTaobaoMatch = async (productIds) => {
    const uid = localStorage.getItem('uid');
    const response = await api.post('/batch_taobao_match', { uid, productIds });
    return response.data;
};

// 헤이셀러 관련 API
export const downloadHeySeller = async (selectedProducts) => {
    const uid = localStorage.getItem('uid');
    const response = await api.get(`/download_heyseller?uid=${uid}`, {
        responseType: 'blob'
    });
    return response.data;
};

export const generateSEO = async (productId) => {
    const uid = localStorage.getItem('uid');
    const response = await api.post('/generate_seo', { uid, product_id: productId });
    return response.data;
};

// 마켓 관리 API
export const getMarketDB = async (uid) => {
    const response = await api.get(`/get_market_db?uid=${uid}`);
    return response.data;
};

export const addMarket = async (uid, marketData) => {
    const response = await api.post('/add_market', { uid, marketData });
    return response.data;
};

export const updateMarket = async (uid, marketId, marketData) => {
    const response = await api.put('/update_market', { uid, marketId, marketData });
    return response.data;
};

export const deleteMarket = async (uid, marketId) => {
    const response = await api.delete('/delete_market', { data: { uid, marketId } });
    return response.data;
};

export const reverseMarket = async (uid, marketId) => {
    const response = await api.post('/market_reversing', { uid, marketId });
    return response.data;
};

// 기본 API 인스턴스 export
export default api;
