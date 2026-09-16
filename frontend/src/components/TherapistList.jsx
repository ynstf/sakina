import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { User, Phone, DollarSign } from 'lucide-react';

export default function TherapistList({ onSelectTherapist, selectedId, currentUserId }) {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTherapists();
    }, []);

    const fetchTherapists = async () => {
        try {
            const response = await API.get('users/therapists/');
            setTherapists(response.data);
        } catch (err) {
            console.error("Error fetching therapists", err);
            setError("Impossible de charger la liste des thérapeutes.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ padding: '10px' }}>Chargement des thérapeutes...</p>;
    }

    if (error) {
        return <p style={{ padding: '10px', color: 'red' }}>{error}</p>;
    }

    // FIX: Filter out the currently logged-in user from the list
    const filteredTherapists = therapists.filter(t => String(t.id) !== String(currentUserId));

    return (
        <div>
            <h3 style={styles.sectionTitle}>Nos Thérapeutes</h3>
            {filteredTherapists.length === 0 ? (
                <p style={styles.emptyText}>Aucun thérapeute disponible pour le moment.</p>
            ) : (
                <ul style={styles.list}>
                    {filteredTherapists.map(t => (
                        <li 
                            key={t.id} 
                            style={styles.listItem(String(selectedId) === String(t.id))}
                            onClick={() => onSelectTherapist(t)}
                        >
                            <div style={styles.cardHeader}>
                                <div style={styles.avatar}>
                                    <User size={20} color="#2e7d32" />
                                </div>
                                <div style={styles.info}>
                                    <strong>{t.username}</strong>
                                    <span style={styles.specialty}>{t.specialty || 'Général'}</span>
                                </div>
                            </div>
                            
                            <div style={styles.details}>
                                {t.phone_number && (
                                    <div style={styles.detailItem}>
                                        <Phone size={14} /> <span>{t.phone_number}</span>
                                    </div>
                                )}
                                <div style={styles.detailItem}>
                                    <DollarSign size={14} /> <span>{t.session_price} DH/séance</span>
                                </div>
                            </div>
                            
                            {t.bio && <p style={styles.bio}>{t.bio}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const styles = {
    sectionTitle: { fontSize: '16px', color: '#555', marginBottom: '15px', paddingLeft: '10px', marginTop: '10px' },
    emptyText: { color: '#888', fontSize: '14px', paddingLeft: '10px' },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    listItem: (isSelected) => ({
        padding: '15px',
        margin: '10px',
        borderRadius: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#e8f5e9' : '#fff',
        border: isSelected ? '2px solid #4caf50' : '1px solid #ddd',
        boxShadow: isSelected ? '0 2px 8px rgba(76, 175, 80, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out'
    }),
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '12px' },
    info: { display: 'flex', flexDirection: 'column' },
    specialty: { fontSize: '12px', color: '#666', marginTop: '2px' },
    details: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: '#555', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ddd' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    bio: { fontSize: '13px', color: '#777', marginTop: '10px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
};
