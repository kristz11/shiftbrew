import React, { useState, useEffect } from 'react';
import { shiftAPI, coffeeShopAPI, statsAPI } from '../api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ManagerDashboard = ({ user }) => {
    const [shifts, setShifts] = useState([]);
    const [coffeeShops, setCoffeeShops] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateShift, setShowCreateShift] = useState(false);
    const [newShift, setNewShift] = useState({
        user_id: '',
        coffee_shop_id: '',
        date: '',
        start_time: '',
        end_time: '',
        role_required: 'barista'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [shiftsData, shopsData] = await Promise.all([
                shiftAPI.getCoffeeShopShifts(user.coffee_shop_id || 1),
                coffeeShopAPI.getAll()
            ]);
            setShifts(shiftsData);
            setCoffeeShops(shopsData);
            
            // Load stats for current month
            const startDate = new Date();
            startDate.setDate(1);
            const endDate = new Date();
            const statsData = await statsAPI.getAllStats({
                coffee_shop_id: user.coffee_shop_id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            });
            setStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShift = async (e) => {
        e.preventDefault();
        try {
            await shiftAPI.createShift({
                ...newShift,
                date: new Date(newShift.date),
                start_time: new Date(`${newShift.date}T${newShift.start_time}`),
                end_time: new Date(`${newShift.date}T${newShift.end_time}`)
            });
            setShowCreateShift(false);
            setNewShift({
                user_id: '',
                coffee_shop_id: '',
                date: '',
                start_time: '',
                end_time: '',
                role_required: 'barista'
            });
            loadData();
        } catch (error) {
            alert('Ошибка при создании смены');
        }
    };

    if (loading) return <div style={styles.loading}>Загрузка...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Панель управляющего</h1>
            
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3>Всего смен</h3>
                        <p style={styles.statValue}>{stats.total_shifts}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Всего часов</h3>
                        <p style={styles.statValue}>{stats.total_hours.toFixed(1)}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Сверхурочные</h3>
                        <p style={styles.statValue}>{stats.total_overtime.toFixed(1)}</p>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h2>Расписание смен</h2>
                <button 
                    style={styles.createButton}
                    onClick={() => setShowCreateShift(!showCreateShift)}
                >
                    {showCreateShift ? 'Отмена' : '+ Создать смену'}
                </button>
            </div>

            {showCreateShift && (
                <form onSubmit={handleCreateShift} style={styles.form}>
                    <div style={styles.formGrid}>
                        <input
                            type="number"
                            placeholder="ID сотрудника"
                            value={newShift.user_id}
                            onChange={(e) => setNewShift({...newShift, user_id: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <input
                            type="number"
                            placeholder="ID кофейни"
                            value={newShift.coffee_shop_id}
                            onChange={(e) => setNewShift({...newShift, coffee_shop_id: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <input
                            type="date"
                            value={newShift.date}
                            onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <input
                            type="time"
                            value={newShift.start_time}
                            onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <input
                            type="time"
                            value={newShift.end_time}
                            onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <select
                            value={newShift.role_required}
                            onChange={(e) => setNewShift({...newShift, role_required: e.target.value})}
                            style={styles.input}
                        >
                            <option value="barista">Бариста</option>
                            <option value="manager">Менеджер</option>
                            <option value="trainee">Стажёр</option>
                        </select>
                    </div>
                    <button type="submit" style={styles.submitButton}>Создать смену</button>
                </form>
            )}

            <div style={styles.shiftsList}>
                {shifts.map((shift) => (
                    <div key={shift.id} style={styles.shiftCard}>
                        <div style={styles.shiftHeader}>
                            <span style={styles.shiftDate}>
                                {format(new Date(shift.date), 'd MMMM yyyy', { locale: ru })}
                            </span>
                            <span style={styles.shiftRole}>{shift.role_required}</span>
                        </div>
                        <div style={styles.shiftBody}>
                            <p>Сотрудник ID: {shift.user_id}</p>
                            <p>Время: {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}</p>
                            <p>Кофейня ID: {shift.coffee_shop_id}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '18px'
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
        color: '#4CAF50',
        marginTop: '10px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    createButton: {
        backgroundColor: '#4CAF50',
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
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    submitButton: {
        backgroundColor: '#2196F3',
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
    shiftRole: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        textTransform: 'uppercase'
    },
    shiftBody: {
        color: '#666'
    }
};

export default ManagerDashboard;