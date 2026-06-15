import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ShiftRequest = ({ request, onApprove, onReject, userRole }) => {
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onApprove(request.id);
        } catch (error) {
            console.error('Error approving request:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await onReject(request.id);
        } catch (error) {
            console.error('Error rejecting request:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f39c12',
            'approved': '#2ecc71',
            'rejected': '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Ожидает',
            'approved': 'Одобрено',
            'rejected': 'Отклонено'
        };
        return texts[status] || status;
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span style={styles.date}>
                    {format(new Date(request.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                </span>
                <span style={{
                    ...styles.status,
                    backgroundColor: getStatusColor(request.status)
                }}>
                    {getStatusText(request.status)}
                </span>
            </div>

            <div style={styles.body}>
                <div style={styles.row}>
                    <span style={styles.label}>Запрос от:</span>
                    <span style={styles.value}>ID {request.requested_by}</span>
                </div>
                
                <div style={styles.row}>
                    <span style={styles.label}>Замена для:</span>
                    <span style={styles.value}>ID {request.to_user_id}</span>
                </div>
                
                <div style={styles.row}>
                    <span style={styles.label}>Смена ID:</span>
                    <span style={styles.value}>{request.from_shift_id}</span>
                </div>
                
                {request.reason && (
                    <div style={styles.reason}>
                        <strong>Причина:</strong> {request.reason}
                    </div>
                )}
            </div>

            {userRole === 'manager' || userRole === 'admin' ? (
                request.status === 'pending' && (
                    <div style={styles.actions}>
                        <button 
                            onClick={handleApprove}
                            disabled={loading}
                            style={styles.approveBtn}
                        >
                            ✓ Одобрить
                        </button>
                        <button 
                            onClick={handleReject}
                            disabled={loading}
                            style={styles.rejectBtn}
                        >
                            ✗ Отклонить
                        </button>
                    </div>
                )
            ) : null}
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
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
        fontSize: '14px',
        color: '#7f8c8d'
    },
    status: {
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
        fontWeight: '500'
    },
    reason: {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#555'
    },
    actions: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
    },
    approveBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    rejectBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    }
};

export default ShiftRequest;