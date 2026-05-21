import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// API Base URL moved outside to prevent recreation on re-renders, which stripping the token
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/users/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Token invalid", error);
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await api.post('/users/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        localStorage.setItem('token', res.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        
        const userRes = await api.get('/users/me');
        setUser(userRes.data);
        navigate('/');
    };

    const register = async (firstName, lastName, username, password, confirmPassword) => {
        await api.post('/users/register', { 
            first_name: firstName, 
            last_name: lastName, 
            username: username, 
            password: password,
            confirm_password: confirmPassword
        });
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, api }}>
            {children}
        </AuthContext.Provider>
    );
};
