import { configureStore, createSlice } from '@reduxjs/toolkit';

// Initial state from localStorage to persist login
const initialState = {
  token: localStorage.getItem('caretrip_token'),
  user: JSON.parse(localStorage.getItem('caretrip_user') || 'null'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('caretrip_token', action.payload.token);
      localStorage.setItem('caretrip_user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('caretrip_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('caretrip_token');
      localStorage.removeItem('caretrip_user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, updateUser, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});
