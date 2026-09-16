import React, { useState, useEffect, useRef } from 'react';
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
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    // Therapist sidebar: list of clients who have messaged them
    const [activeClients, setActiveClients] = useState([]); // [{ id, username }]
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUserId(decoded.user_id);
            fetchMyProfile();
        } catch (error) {
            console.error("Invalid token", error);
            handleLogout();
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [navigate]);

    const fetchMyProfile = async () => {
        try {
            // Use the /me/ endpoint to reliably get the current user's role
            const response = await API.get('users/me/');
            const me = response.data;
            setUserId(me.id);
            const userIsTherapist = me.role === 'THERAPIST';
            setIsTherapist(userIsTherapist);

            if (userIsTherapist) {
                // Load client conversations immediately, then poll every 10s for new ones
                await loadConversations(me.id);
                pollIntervalRef.current = setInterval(() => loadConversations(me.id), 10000);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback: if /me/ fails, log the user out
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async (myId) => {
        try {
            // 1. Get list of client_ids who have chatted with this therapist
            const token = localStorage.getItem('access_token');
            const convRes = await fetch(`${import.meta.env.VITE_CHAT_API_URL}chat/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const convData = await convRes.json();
            const clientIds = (convData.client_ids || []).filter(cid => String(cid) !== String(myId));

            if (clientIds.length === 0) {
                setActiveClients([]);
                return;
            }

            // 2. Fetch usernames for each client ID from Django
            const clientDetails = await Promise.all(
                clientIds.map(async (cid) => {
                    try {
                        const res = await API.get(`users/user/${cid}/`);
                        return { id: String(cid), username: res.data.username };
                    } catch {
                        return { id: String(cid), username: `Client #${cid}` };
                    }
                })
            );
            setActiveClients(clientDetails);
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    };

    // Called by ChatWindow when a new message arrives from an unknown client
    const onNewClientMessage = (clientId, clientUsername) => {
        setActiveClients(prev => {
            if (prev.some(c => String(c.id) === String(clientId))) return prev;
            return [...prev, { id: String(clientId), username: clientUsername || `Client #${clientId}` }];
        });
    };

    const handleLogout = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const openChat = (id, name, role) => {
        setSelectedChatUser({ id: String(id), name, role });
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingCard}>
                    <div style={styles.spinner}></div>
                    <p>Chargement de votre espace...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.dashboardLayout}>
            {/* ---- SIDEBAR ---- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={{ margin: 0, color: '#2e7d32', fontSize: '22px' }}>🌿 Sakina</h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#555' }}>
                        <strong>{username}</strong>
                    </p>
                    <span style={styles.roleBadge(isTherapist)}>
                        {isTherapist ? '🩺 Thérapeute' : '👤 Client'}
                    </span>
                </div>

                <div style={styles.sidebarContent}>
                    {isTherapist ? (
                        /* THERAPIST VIEW: show clients who have sent messages */
                        <div>
                            <p style={styles.sectionLabel}>MES CONVERSATIONS</p>
                            {activeClients.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p style={{ fontSize: '32px', margin: 0 }}>💬</p>
                                    <p>En attente de messages...</p>
                                    <small>Les clients qui vous envoient un message apparaîtront ici.</small>
                                </div>
                            ) : (
                                <ul style={styles.list}>
                                    {activeClients.map(client => (
                                        <li
                                            key={client.id}
                                            style={styles.listItem(selectedChatUser?.id === client.id)}
                                            onClick={() => openChat(client.id, client.username, 'CLIENT')}
                                        >
                                            <div style={styles.clientAvatar}>{client.username.charAt(0).toUpperCase()}</div>
                                            <div style={styles.clientInfo}>
                                                <strong>{client.username}</strong>
                                                <small style={{ color: '#888' }}>Cliquez pour ouvrir</small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        /* CLIENT VIEW: show therapists to contact */
                        <TherapistList
                            onSelectTherapist={(t) => openChat(t.id, t.username, 'THERAPIST')}
                            selectedId={selectedChatUser?.id}
                            currentUserId={userId}
                        />
                    )}
                </div>

                <div style={styles.sidebarFooter}>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        🚪 Se Déconnecter
                    </button>
                </div>
            </div>

            {/* ---- MAIN CHAT AREA ---- */}
            <div style={styles.mainArea}>
                {selectedChatUser ? (
                    <ChatWindow
                        currentUserId={userId}
                        targetUser={selectedChatUser}
                        isTherapist={isTherapist}
                        onNewMessage={isTherapist ? onNewClientMessage : null}
                    />
                ) : (
                    <div style={styles.welcomeState}>
                        <h2 style={{ color: '#2e7d32' }}>Bienvenue, {username} !</h2>
                        <p style={{ color: '#888', maxWidth: '400px', textAlign: 'center' }}>
                            {isTherapist
                                ? 'Sélectionnez une conversation dans la liste de gauche pour commencer à répondre.'
                                : 'Choisissez un thérapeute dans la liste de gauche pour démarrer une consultation.'}
                        </p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin-dash { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

const styles = {
    dashboardLayout: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f4f6f9' },
    sidebar: { width: '300px', minWidth: '300px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f0fdf4' },
    roleBadge: (isTherapist) => ({
        display: 'inline-block',
        marginTop: '6px',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: isTherapist ? '#d1fae5' : '#dbeafe',
        color: isTherapist ? '#065f46' : '#1e40af',
    }),
    sidebarContent: { flex: 1, overflowY: 'auto', padding: '10px 0' },
    sidebarFooter: { padding: '16px 20px', borderTop: '1px solid #e5e7eb' },
    sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '1px', padding: '8px 20px 4px', margin: 0 },
    list: { listStyle: 'none', padding: '0 10px', margin: 0 },
    listItem: (isSelected) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        margin: '4px 0',
        borderRadius: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
        border: isSelected ? '1px solid #6ee7b7' : '1px solid transparent',
        transition: 'all 0.15s ease',
    }),
    clientAvatar: {
        width: '38px', height: '38px', borderRadius: '50%',
        backgroundColor: '#2e7d32', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', flexShrink: 0
    },
    clientInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
    emptyState: { padding: '30px 20px', textAlign: 'center', color: '#9ca3af', lineHeight: '1.6' },
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    welcomeState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' },
    welcomeIcon: { fontSize: '60px' },
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9' },
    loadingCard: { textAlign: 'center', color: '#555' },
    spinner: { width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: '3px solid #2e7d32', animation: 'spin-dash 0.8s linear infinite', margin: '0 auto 12px' },
};