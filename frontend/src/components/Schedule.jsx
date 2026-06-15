import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Schedule = ({ shifts, userRole }) => {
    if (!shifts || shifts.length === 0) {
        return (
            <div style={styles.empty}>
                <p>Смен пока нет</p>
            </div>
        );
    }

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
            {shifts.map((shift) => (
                <div key={shift.id} style={styles.shiftCard}>
                    <div style={styles.header}>
                        <span style={styles.date}>
                            {format(new Date(shift.date), 'd MMMM yyyy', { locale: ru })}
                        </span>
                        <span style={{
                            ...styles.badge,
                            backgroundColor: shift.is_confirmed ? '#2ecc71' : '#f39c12'
                        }}>
                            {shift.is_confirmed ? '✓ Подтверждено' : '○ Ожидание'}
                        </span>
                    </div>
                    
                    <div style={styles.body}>
                        <div style={styles.row}>
                            <span style={styles.label}>🕐 Время:</span>
                            <span style={styles.value}>
                                {format(new Date(shift.start_time), 'HH:mm')} - 
                                {format(new Date(shift.end_time), 'HH:mm')}
                            </span>
                        </div>
                        
                        {userRole === 'manager' || userRole === 'admin' ? (
                            <div style={styles.row}>
                                <span style={styles.label}>👤 Сотрудник ID:</span>
                                <span style={styles.value}>{shift.user_id}</span>
                            </div>
                        ) : null}
                        
                        <div style={styles.row}>
                            <span style={styles.label}>☕ Кофейня:</span>
                            <span style={styles.value}>ID {shift.coffee_shop_id}</span>
                        </div>
                        
                        <div style={styles.row}>
                            <span style={styles.label}>👔 Роль:</span>
                            <span style={styles.value}>{getRoleName(shift.role_required)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: {
        display: 'grid',
        gap: '15px'
    },
    empty: {
        textAlign: 'center',
        padding: '40px',
        color: '#999',
        backgroundColor: 'white',
        borderRadius: '8px'
    },
    shiftCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
    },
    date: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        color: 'white',
        fontWeight: '500'
    },
    body: {
        display: 'grid',
        gap: '10px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    label: {
        color: '#7f8c8d',
        fontSize: '14px'
    },
    value: {
        color: '#2c3e50',
        fontWeight: '500',
        fontSize: '14px'
    }
};

export default Schedule;