import axios from 'axios';

// ngrok URL 설정
const API_BASE_URL = 'https://db705ff68777754c.ngrok.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

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

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
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
        console.log('Sending signup request:', { email, name });
        const response = await api.post('/signup', {
            email,
            password,
            name
        });
        console.log('Signup response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Signup error details:', error.response || error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });
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
export const searchProducts = async (keyword) => {
    const uid = localStorage.getItem('uid');
    try {
        const response = await api.post('/search', { keyword, uid });
        return response.data;
    } catch (error) {
        console.error('Search error:', error.response || error);
        throw error;
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

export default api;
