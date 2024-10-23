import axios from 'axios';

const API_URL = 'https://moray-leading-jolly.ngrok-free.app';  // ngrok URL로 변경

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// uid를 로컬 스토리지에서 가져오는 함수
const getUid = () => localStorage.getItem('uid');

// 요청 인터셉터에 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const searchProducts = async (keyword) => {
  const uid = getUid();
  const response = await api.post('/search', { keyword, uid });
  return response.data;
};

export const collectProducts = async (productIds) => {
  const uid = getUid();
  const response = await api.post('/collect', { selected_product_ids: productIds, uid });
  return response.data;
};

export const getCollectedProducts = async () => {
  const uid = getUid();
  const response = await api.get('/get_collected_products', { params: { uid } });
  return response.data;
};

export const matchTaobaoProduct = async (imageUrl) => {
  const response = await api.post('/taobao_match', { image_url: imageUrl });
  return response.data;
};

export const signup = async (email, password, name) => {
  const response = await api.post('/signup', { email, password, name });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getUserInfo = async () => {
  const uid = getUid();
  const response = await api.get('/user-info', { params: { uid } });
  return response.data;
};

export const collectMarkets = async (marketNames) => {
  const uid = getUid();
  const response = await api.post('/collect_market', { market_data: marketNames, uid });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('uid');
  localStorage.removeItem('userInfo');
};

export const batchTaobaoMatch = async (productIds) => {
  const uid = getUid();
  const response = await api.post('/batch_taobao_match', { productIds, uid });
  return response.data;
};

export const generateSEO = async (productId) => {
  const uid = getUid();
  const response = await api.post('/generate_seo', { product_id: productId, uid });
  return response.data;
};

export const downloadHeySeller = async () => {
  const uid = getUid();
  const response = await api.get('/download_heyseller', {
    params: { uid },
    responseType: 'blob'
  });
  return response.data;
};

export const getSearchHistory = async () => {
  const uid = getUid();
  const response = await api.get('/search_history', { params: { uid } });
  return response.data;
};

export const getSearchResult = async (historyId) => {
  const uid = getUid();
  const response = await api.get('/search_result', { params: { uid, history_id: historyId } });
  return response.data;
};
