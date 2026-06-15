import React, { useState, useEffect } from 'react';
import { shiftAPI, wishAPI, requestAPI, statsAPI } from '../api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BaristaDashboard = ({ user }) => {
    const [shifts, setShifts] = useState([]);
    const [wishes, setWishes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWishForm, setShowWishForm] = useState(false);
    const [newWish, setNewWish] = useState({
        date: '',
        wish_type: 'unavailable',
        comment: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [shiftsData, wishesData, requestsData] = await Promise.all([
                shiftAPI.getMyShifts(),
                wishAPI.getMyWishes(),
                requestAPI.getMyRequests()
            ]);
            setShifts(shiftsData);
            setWishes(wishesData);
            setRequests(requestsData);

            // Load stats
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();
            const statsData = await statsAPI.getMyStats(startDate, endDate);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWish = async (e) => {
        e.preventDefault();
        try {
            await wishAPI.createWish({
                ...newWish,
                date: new Date(newWish.date)
            });
            setShowWishForm(false);
            setNewWish({ date: '', wish_type: 'unavailable', comment: '' });
            loadData();
        } catch (error) {
            alert('Ошибка при создании пожелания');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Мой кабинет</h1>
            
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3>Смен за месяц</h3>
                        <p style={styles.statValue}>{stats.shifts_count}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Отработано часов</h3>
                        <p style={styles.statValue}>{stats.total_hours.toFixed(1)}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Сверхурочные</h3>
                        <p style={styles.statValue}>{stats.total_overtime.toFixed(1)}</p>
                    </div>
                </div>
            )}

            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2>Моё расписание</h2>
                    <button 
                        style={styles.wishButton}
                        onClick={() => setShowWishForm(!showWishForm)}
                    >
                        {showWishForm ? 'Отмена' : '+ Пожелание по смене'}
                    </button>
                </div>

                {showWishForm && (
                    <form onSubmit={handleCreateWish} style={styles.form}>
                        <div style={styles.formGroup}>
                            <input
                                type="date"
                                value={newWish.date}
                                onChange={(e) => setNewWish({...newWish, date: e.target.value})}
                                style={styles.input}
                                required
                            />
                            <select
                                value={newWish.wish_type}
                                onChange={(e) => setNewWish({...newWish, wish_type: e.target.value})}
                                style={styles.input}
                            >
                                <option value="unavailable">Не могу работать</option>
                                <option value="available">Могу работать</option>
                                <option value="prefer_morning">Предпочитаю утро</option>
                                <option value="prefer_evening">Предпочитаю вечер</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Комментарий"
                                value={newWish.comment}
                                onChange={(e) => setNewWish({...newWish, comment: e.target.value})}
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.submitButton}>Отправить пожелание</button>
                    </form>
                )}

                <div style={styles.shiftsList}>
                    {shifts.length === 0 ? (
                        <p style={styles.emptyMessage}>Смен пока нет</p>
                    ) : (
                        shifts.map((shift) => (
                            <div key={shift.id} style={styles.shiftCard}>
                                <div style={styles.shiftHeader}>
                                    <span style={styles.shiftDate}>
                                        {format(new Date(shift.date), 'd MMMM yyyy', { locale: ru })}
                                    </span>
                                    <span style={styles.shiftStatus}>
                                        {shift.is_confirmed ? '✓ Подтверждено' : '○ Ожидание'}
                                    </span>
                                </div>
                                <div style={styles.shiftBody}>
                                    <p>🕐 {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}</p>
                                    <p> Кофейня ID: {shift.coffee_shop_id}</p>
                                    <p>👤 Роль: {shift.role_required}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {wishes.length > 0 && (
                <div style={styles.section}>
                    <h2>Мои пожелания</h2>
                    <div style={styles.wishesList}>
                        {wishes.map((wish) => (
                            <div key={wish.id} style={styles.wishCard}>
                                <span>{format(new Date(wish.date), 'd MMM yyyy')}</span>
                                <span style={styles.wishType}>{wish.wish_type}</span>
                                {wish.comment && <p>{wish.comment}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '30px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    statValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#3498db',
        marginTop: '10px'
    },
    section: {
        marginBottom: '30px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    wishButton: {
        backgroundColor: '#9b59b6',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    form: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    formGroup: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '15px'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        flex: '1',
        minWidth: '150px'
    },
    submitButton: {
        backgroundColor: '#9b59b6',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    shiftsList: {
        display: 'grid',
        gap: '15px'
    },
    shiftCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    shiftHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    },
    shiftDate: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '18px'
    },
    shiftStatus: {
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px'
    },
    shiftBody: {
        color: '#666',
        lineHeight: '1.6'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#999',
        padding: '40px'
    },
    wishesList: {
        display: 'grid',
        gap: '10px'
    },
    wishCard: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
    },
    wishType: {
        backgroundColor: '#f39c12',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        textTransform: 'capitalize'
    }
};

export default BaristaDashboard;