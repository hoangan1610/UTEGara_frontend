import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.6:5000/api', // Your backend address
});

// API for User Management
export const login = (credentials) => api.post('/users/login', credentials);
export const updateUser = (updatedData, token) => {
  return api.put('/users/update', updatedData, {
    headers: {
      Authorization: `Bearer ${token}`, // Include token in the headers
    },
  });
};

// API for Tasks
export const fetchTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);

// API for Events
export const fetchEvents = () => api.get('/events');
export const createEvent = (eventData) => api.post('/events', eventData);

// API for User Creation
export const createUser = (userData) => api.post('/users', userData);
