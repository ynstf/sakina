import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios';
import TherapistList from '../components/TherapistList';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Utilisateur';
    const [userId, setUserId] = useState(null);
    const [isTherapist, setIsTherapist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedChatUser, setSelectedChatUser] = useState(null); // { id, name, role }

    // Therapist specific state
    const [activeClientIds, setActiveClientIds] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUserId(decoded.user_id);
            checkRole(decoded.user_id, token);
        } catch (error) {
            console.error("Invalid token", error);
            handleLogout();
        }
    }, [navigate]);

    const checkRole = async (uid, token) => {
        try {
            // Fetch all therapists to see if current user is one of them
            const response = await API.get('users/therapists/');
            const therapists = response.data;
            const isUserTherapist = therapists.some(t => t.id === uid);
            setIsTherapist(isUserTherapist);

            if (isUserTherapist) {
                // If therapist, fetch active conversations
                fetchActiveConversations(token);
            }
        } catch (error) {
            console.error("Error checking role:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveConversations = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CHAT_API_URL}chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data && data.client_ids) {
                setActiveClientIds(data.client_ids);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const openChat = (id, name, role) => {
        setSelectedChatUser({ id, name, role });
    };

    if (loading) {
        return <div style={styles.container}><h2>Chargement...</h2></div>;
    }

    return (
        <div style={styles.dashboardLayout}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={{ margin: 0, color: '#2e7d32' }}>Sakina</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                        Connecté: <strong>{username}</strong> <br/>
                        <small>({isTherapist ? 'Thérapeute' : 'Client'})</small>
                    </p>
                </div>

                <div style={styles.sidebarContent}>
                    {isTherapist ? (
                        <div>
                            <h3 style={styles.sectionTitle}>Vos Conversations</h3>
                            {activeClientIds.length === 0 ? (
                                <p style={styles.emptyText}>Aucune conversation active.</p>
                            ) : (
                                <ul style={styles.list}>
                                    {activeClientIds.map(cid => (
                                        <li 
                                            key={cid} 
                                            style={styles.listItem(selectedChatUser?.id === cid)}
                                            onClick={() => openChat(cid, `Client #${cid}`, 'CLIENT')}
                                        >
                                            Conversation avec Client #{cid}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <TherapistList onSelectTherapist={(t) => openChat(t.id, t.username, 'THERAPIST')} selectedId={selectedChatUser?.id} />
                    )}
                </div>

                <div style={styles.sidebarFooter}>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Se Déconnecter</button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={styles.mainArea}>
                {selectedChatUser ? (
                    <ChatWindow 
                        currentUserId={userId}
                        targetUser={selectedChatUser} 
                        isTherapist={isTherapist} 
                    />
                ) : (
                    <div style={styles.emptyState}>
                        <h3>Bienvenue sur votre espace !</h3>
                        <p>Sélectionnez une personne dans le menu de gauche pour commencer à discuter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    dashboardLayout: { display: 'flex', height: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, sans-serif' },
    sidebar: { width: '320px', backgroundColor: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #ddd', backgroundColor: '#f0fdf4' },
    sidebarContent: { flex: 1, overflowY: 'auto', padding: '10px' },
    sidebarFooter: { padding: '20px', borderTop: '1px solid #ddd' },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
    sectionTitle: { fontSize: '16px', color: '#555', marginBottom: '10px', paddingLeft: '10px', marginTop: '10px' },
    emptyText: { color: '#888', fontSize: '14px', paddingLeft: '10px' },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    listItem: (isSelected) => ({
        padding: '15px',
        margin: '5px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#e8f5e9' : '#fff',
        border: isSelected ? '1px solid #4caf50' : '1px solid #eee',
        transition: 'background-color 0.2s',
        fontWeight: isSelected ? 'bold' : 'normal'
    }),
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9' },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#777' }
};