import axios from 'axios'; 

const api = axios.create({
  baseURL: 'http://192.168.1.3:3001/api/v1', // Cập nhật URL backend đúng
});

// API cho Quản lý Người Dùng (User Management)
export const login = (credentials) => api.post('/auth/login', credentials);  // Endpoint đăng nhập đã thay đổi
export const updateUser = (updatedData, token) => {
  return api.put('/users/update', updatedData, {
    headers: {
      Authorization: `Bearer ${token}`, // Bao gồm token trong header
    },
  });
};

// API cho Quản lý Task
export const fetchTasks = (token) => {
  return api.get('/tasks', {
    headers: {
      Authorization: `Bearer ${token}`, // Đảm bảo gửi token trong header
    },
  });
};

export const createTask = (taskData, token) => {
  return api.post('/tasks', taskData, {
    headers: {
      Authorization: `Bearer ${token}`, // Đảm bảo gửi token trong header
    },
  });
};

// API cho Quản lý Người Dùng - Tạo Người Dùng (User Creation)
export const createUser = (userData) => api.post('/users', userData);

