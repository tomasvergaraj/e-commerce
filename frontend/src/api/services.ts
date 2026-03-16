import api from './client';

// ── Auth ──
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// ── Users ──
export const usersApi = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  createAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  // Admin
  list: (params: any) => api.get('/users/admin/list', { params }),
  getById: (id: string) => api.get(`/users/admin/${id}`),
  adminUpdate: (id: string, data: any) => api.put(`/users/admin/${id}`, data),
};

// ── Categories ──
export const categoriesApi = {
  getAll: (params?: any) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── Products ──
export const productsApi = {
  getAll: (params: any) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/detail/${slug}`),
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),
  getOnSale: (limit?: number) => api.get('/products/on-sale', { params: { limit } }),
  getRelated: (slug: string) => api.get(`/products/related/${slug}`),
  getBrands: () => api.get('/products/brands'),
  // Admin
  adminList: (params: any) => api.get('/products/admin/list', { params }),
  adminGetById: (id: string) => api.get(`/products/admin/${id}`),
  getLowStock: () => api.get('/products/admin/low-stock'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  createVariant: (productId: string, data: any) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId: string, data: any) => api.put(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId: string) => api.delete(`/products/variants/${variantId}`),
};

// ── Cart ──
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data: any) => api.post('/cart/items', data),
  updateItem: (id: string, data: any) => api.put(`/cart/items/${id}`, data),
  removeItem: (id: string) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart/clear'),
  merge: () => api.post('/cart/merge'),
};

// ── Orders ──
export const ordersApi = {
  checkout: (data: any) => api.post('/orders/checkout', data),
  myOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  myOrderDetail: (orderNumber: string) => api.get(`/orders/my-orders/${orderNumber}`),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  // Admin
  getStats: () => api.get('/orders/admin/stats'),
  adminList: (params: any) => api.get('/orders/admin/list', { params }),
  adminGetById: (id: string) => api.get(`/orders/admin/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/orders/admin/${id}/status`, data),
  addNote: (id: string, notes: string) => api.put(`/orders/admin/${id}/notes`, { notes }),
};

// ── Payments ──
export const paymentsApi = {
  process: (orderId: string) => api.post(`/payments/process/${orderId}`),
};

// ── Shipping ──
export const shippingApi = {
  getMethods: () => api.get('/shipping/methods'),
  adminGetMethods: () => api.get('/shipping/admin/methods'),
  create: (data: any) => api.post('/shipping/methods', data),
  update: (id: string, data: any) => api.put(`/shipping/methods/${id}`, data),
  delete: (id: string) => api.delete(`/shipping/methods/${id}`),
};

// ── Promotions ──
export const promotionsApi = {
  validate: (data: any) => api.post('/promotions/validate', data),
  getAll: () => api.get('/promotions/coupons'),
  create: (data: any) => api.post('/promotions/coupons', data),
  update: (id: string, data: any) => api.put(`/promotions/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/coupons/${id}`),
};

// ── Wishlist ──
export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  toggle: (productId: string) => api.post(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

// ── Reviews ──
export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  getEligibility: (productId: string) => api.get(`/reviews/eligibility/${productId}`),
  create: (data: any) => api.post('/reviews', data),
  adminGetAll: () => api.get('/reviews/admin/all'),
  adminGetPending: () => api.get('/reviews/admin/pending'),
  approve: (id: string) => api.put(`/reviews/admin/approve/${id}`),
  reject: (id: string) => api.delete(`/reviews/admin/reject/${id}`),
};

// ── Banners ──
export const bannersApi = {
  getActive: () => api.get('/banners'),
  adminGetAll: () => api.get('/banners/admin/all'),
  create: (data: any) => api.post('/banners', data),
  update: (id: string, data: any) => api.put(`/banners/${id}`, data),
  delete: (id: string) => api.delete(`/banners/${id}`),
};

// ── Settings ──
export const settingsApi = {
  getPublic: () => api.get('/settings/public'),
  getPublicPages: () => api.get('/settings/pages'),
  getPage: (slug: string) => api.get(`/settings/pages/${slug}`),
  adminGetAll: () => api.get('/settings/admin/all'),
  bulkUpdate: (data: any) => api.put('/settings/admin/bulk', data),
  getPages: () => api.get('/settings/admin/pages'),
  createPage: (data: any) => api.post('/settings/admin/pages', data),
  updatePage: (id: string, data: any) => api.put(`/settings/admin/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/settings/admin/pages/${id}`),
};

// ── Audit ──
export const auditApi = {
  getAll: (params: any) => api.get('/audit', { params }),
};

// ── Upload ──
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
