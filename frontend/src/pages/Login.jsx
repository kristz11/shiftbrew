import React, { useState } from 'react';
import { authAPI } from '../api';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const tokenData = await authAPI.login(email, password);
            const userData = await authAPI.getCurrentUser();
            onLogin(userData, tokenData.access_token);
        } catch (err) {
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>☕ ShiftBrew</h1>
                <h2 style={styles.subtitle}>Вход в систему</h2>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="admin@coffee.ru"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                
                <div style={styles.demoInfo}>
                    <p><strong>Тестовые данные:</strong></p>
                    <p>Управляющий: admin@coffee.ru / admin123</p>
                    <p>Бариста: barista@coffee.ru / barista123</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    subtitle: {
        textAlign: 'center',
        color: '#7f8c8d',
        marginBottom: '30px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontWeight: '600',
        color: '#2c3e50'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    button: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px'
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    demoInfo: {
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#666'
    }
};

export default Login;