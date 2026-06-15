import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const getRoleName = (role) => {
        const roles = {
            'manager': 'Управляющий',
            'admin': 'Администратор',
            'barista': 'Бариста',
            'trainee': 'Стажёр'
        };
        return roles[role] || role;
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>☕ ShiftBrew</Link>
                <div style={styles.userInfo}>
                    <span style={styles.userName}>{user.full_name}</span>
                    <span style={styles.userRole}>{getRoleName(user.role)}</span>
                    <Link to="/profile" style={styles.profileLink}>Профиль</Link>
                    <button onClick={onLogout} style={styles.logoutBtn}>Выйти</button>
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userName: {
        fontWeight: '600'
    },
    userRole: {
        backgroundColor: '#34495e',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px'
    },
    profileLink: {
        color: '#3498db',
        textDecoration: 'none'
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    }
};

export default Navbar;