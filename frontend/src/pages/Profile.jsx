import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Profile = ({ user }) => {
    const getStatusName = (status) => {
        const statuses = {
            'active': 'Активен',
            'on_vacation': 'В отпуске',
            'on_sick_leave': 'На больничном',
            'inactive': 'Не активен'
        };
        return statuses[status] || status;
    };

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
        <div style={styles.container}>
            <h1 style={styles.title}>Личный кабинет</h1>
            
            <div style={styles.profileCard}>
                <div style={styles.avatar}>
                    {user.full_name.charAt(0).toUpperCase()}
                </div>
                
                <div style={styles.info}>
                    <h2 style={styles.name}>{user.full_name}</h2>
                    <p style={styles.email}>{user.email}</p>
                    
                    <div style={styles.badges}>
                        <span style={styles.badge}>{getRoleName(user.role)}</span>
                        <span style={{
                            ...styles.badge,
                            backgroundColor: user.status === 'active' ? '#2ecc71' : '#95a5a6'
                        }}>
                            {getStatusName(user.status)}
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3>Информация о работе</h3>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <label>Дата приёма</label>
                        <value>{format(new Date(user.hire_date), 'd MMMM yyyy', { locale: ru })}</value>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Кофейня</label>
                        <value>ID: {user.coffee_shop_id || 'Не назначена'}</value>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3>Медицинские осмотры</h3>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <label>Последний осмотр</label>
                        <value>
                            {user.last_medical_exam 
                                ? format(new Date(user.last_medical_exam), 'd MMMM yyyy', { locale: ru })
                                : 'Не пройден'}
                        </value>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Следующий осмотр</label>
                        <value>
                            {user.next_medical_exam 
                                ? format(new Date(user.next_medical_exam), 'd MMMM yyyy', { locale: ru })
                                : 'Не назначен'}
                        </value>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3>Аттестация</h3>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <label>Уровень</label>
                        <value>{user.certification_level} уровень</value>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Последняя аттестация</label>
                        <value>
                            {user.last_certification_date 
                                ? format(new Date(user.last_certification_date), 'd MMMM yyyy', { locale: ru })
                                : 'Не пройдена'}
                        </value>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '30px'
    },
    profileCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        marginBottom: '30px'
    },
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        fontWeight: 'bold'
    },
    info: {
        flex: 1
    },
    name: {
        margin: '0 0 5px 0',
        color: '#2c3e50'
    },
    email: {
        margin: '0 0 15px 0',
        color: '#7f8c8d'
    },
    badges: {
        display: 'flex',
        gap: '10px'
    },
    badge: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '16px',
        fontSize: '14px'
    },
    section: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: '600',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    value: {
        color: '#2c3e50',
        fontSize: '16px'
    }
};

export default Profile;