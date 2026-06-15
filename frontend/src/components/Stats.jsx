import React from 'react';

const Stats = ({ title, value, icon, color }) => {
    const colors = {
        blue: '#3498db',
        green: '#2ecc71',
        purple: '#9b59b6',
        orange: '#f39c12',
        red: '#e74c3c'
    };

    return (
        <div style={styles.card}>
            <div style={{...styles.icon, backgroundColor: colors[color] || colors.blue}}>
                {icon}
            </div>
            <div style={styles.content}>
                <h3 style={styles.title}>{title}</h3>
                <p style={styles.value}>{value}</p>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    icon: {
        width: '50px',
        height: '50px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: 'white'
    },
    content: {
        flex: 1
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '14px',
        color: '#7f8c8d',
        fontWeight: '500'
    },
    value: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50'
    }
};

export default Stats;