import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import BaristaDashboard from './pages/BaristaDashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
    }

    return (
        <Router>
            <div className="App">
                {user && <Navbar user={user} onLogout={handleLogout} />}
                <Routes>
                    <Route 
                        path="/login" 
                        element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/" 
                        element={
                            user ? (
                                user.role === 'manager' || user.role === 'admin' ? (
                                    <ManagerDashboard user={user} />
                                ) : (
                                    <BaristaDashboard user={user} />
                                )
                            ) : (
                                <Navigate to="/login" />
                            )
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;