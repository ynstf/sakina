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


    const openChat = (id, name, role) => {
        setSelectedChatUser({ id: String(id), name, role });
    };

    if (loading) {
        return (
            <div className="sk-dash-loading">
                <style>{`
                    .sk-dash-loading {
                        --sk-bg: #F6F4EE;
                        --sk-primary: #2F6F4E;
                        --sk-text-muted: #5B6660;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: var(--sk-bg);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                    .sk-dash-loading-card {
                        text-align: center;
                        color: var(--sk-text-muted);
                    }
                    .sk-dash-spinner {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border: 3px solid #E1DCCE;
                        border-top: 3px solid var(--sk-primary);
                        animation: sk-spin 0.8s linear infinite;
                        margin: 0 auto 12px;
                    }
                    @keyframes sk-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
                <div className="sk-dash-loading-card">
                    <div className="sk-dash-spinner"></div>
                    <p>Chargement de votre espace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sk-dashboard" data-has-chat={Boolean(selectedChatUser)}>
            {/* Same "sk-" design system as the rest of the app, embedded here.
                Mobile behavior: sidebar and chat area stack into a single view;
                which one shows is driven by the existing `selectedChatUser` state
                (no new state added) via the data-has-chat attribute below. */}
            <style>{`
                .sk-dashboard {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #5B6660;
                    --sk-primary: #2F6F4E;
                    --sk-primary-hover: #275C41;
                    --sk-badge-therapist-bg: #DCEFE2;
                    --sk-badge-therapist-text: #1F5A3C;
                    --sk-badge-client-bg: #E4EAF7;
                    --sk-badge-client-text: #2C3E75;
                    --sk-danger-bg: #FBEAE9;
                    --sk-danger-text: #A32E26;
                    --sk-danger-border: #E9BAB5;
                    --sk-focus-ring: rgba(47, 111, 78, 0.35);

                    display: flex;
                    height: 100vh;
                    background-color: var(--sk-bg);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: var(--sk-text);
                    overflow: hidden;
                }

                .sk-dashboard * {
                    box-sizing: border-box;
                }

                .sk-sidebar {
                    width: 300px;
                    min-width: 300px;
                    background-color: var(--sk-surface);
                    border-right: 1px solid var(--sk-border);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 2px 0 8px rgba(31, 42, 36, 0.04);
                }

                .sk-sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--sk-border);
                    background-color: #F0F7F2;
                }

                .sk-sidebar-brand {
                    margin: 0;
                    color: var(--sk-primary);
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .sk-sidebar-username {
                    margin: 8px 0 0;
                    font-size: 0.9rem;
                    color: var(--sk-text-muted);
                }

                .sk-role-badge {
                    display: inline-block;
                    margin-top: 6px;
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .sk-role-badge--therapist {
                    background-color: var(--sk-badge-therapist-bg);
                    color: var(--sk-badge-therapist-text);
                }

                .sk-role-badge--client {
                    background-color: var(--sk-badge-client-bg);
                    color: var(--sk-badge-client-text);
                }

                .sk-sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 0;
                }


                .sk-section-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--sk-text-muted);
                    letter-spacing: 0.06em;
                    padding: 8px 20px 4px;
                    margin: 0;
                }

                .sk-client-list {
                    list-style: none;
                    padding: 0 10px;
                    margin: 0;
                }

                .sk-client-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    margin: 4px 0;
                    border-radius: 10px;
                    cursor: pointer;
                    background-color: transparent;
                    border: 1px solid transparent;
                    transition: background-color 0.15s ease, border-color 0.15s ease;
                }

                .sk-client-item:hover {
                    background-color: #F6F4EE;
                }

                .sk-client-item--selected {
                    background-color: #EAF4EE;
                    border-color: #A8D4B8;
                }

                .sk-client-item:focus-visible {
                    outline: 3px solid var(--sk-focus-ring);
                    outline-offset: 2px;
                }

                .sk-client-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background-color: var(--sk-primary);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .sk-client-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .sk-client-info strong {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .sk-client-info small {
                    color: var(--sk-text-muted);
                }

                .sk-empty-state {
                    padding: 30px 20px;
                    text-align: center;
                    color: var(--sk-text-muted);
                    line-height: 1.6;
                }

                .sk-empty-state-icon {
                    font-size: 2rem;
                    margin: 0;
                }

                .sk-main-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-width: 0;
                }

                .sk-mobile-back {
                    display: none;
                }

                .sk-welcome-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 24px;
                    text-align: center;
                }

                .sk-welcome-title {
                    color: var(--sk-primary);
                    margin: 0;
                    font-size: 1.3rem;
                }

                .sk-welcome-text {
                    color: var(--sk-text-muted);
                    max-width: 400px;
                    margin: 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    .sk-dashboard * {
                        transition-duration: 0.001ms !important;
                        animation-duration: 0.001ms !important;
                    }
                }

                /* ---- Mobile: stack into a single-pane view ----
                   Which pane shows is driven by whether a chat is selected
                   (data-has-chat, set from the existing selectedChatUser state) */
                @media (max-width: 768px) {
                    .sk-dashboard {
                        flex-direction: column;
                        height: 100dvh;
                    }

                    .sk-sidebar {
                        width: 100%;
                        min-width: 0;
                        border-right: none;
                        border-bottom: 1px solid var(--sk-border);
                    }

                    .sk-dashboard[data-has-chat="true"] .sk-sidebar {
                        display: none;
                    }

                    .sk-dashboard[data-has-chat="false"] .sk-main-area {
                        display: none;
                    }

                    .sk-mobile-back {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        align-self: flex-start;
                        margin: 12px 16px 0;
                        padding: 8px 14px;
                        background-color: var(--sk-surface);
                        color: var(--sk-text);
                        border: 1px solid var(--sk-border);
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 500;
                    }

                    .sk-mobile-back:focus-visible {
                        outline: 3px solid var(--sk-focus-ring);
                        outline-offset: 2px;
                    }
                }
            `}</style>

            {/* ---- SIDEBAR ---- */}
            <div className="sk-sidebar">
                <div className="sk-sidebar-header">
                    <h2 className="sk-sidebar-brand">🌿 Sakina</h2>
                    <p className="sk-sidebar-username"><strong>{username}</strong></p>
                    <span className={`sk-role-badge ${isTherapist ? 'sk-role-badge--therapist' : 'sk-role-badge--client'}`}>
                        {isTherapist ? '🩺 Thérapeute' : '👤 Client'}
                    </span>
                </div>

                <div className="sk-sidebar-content">
                    {isTherapist ? (
                        /* THERAPIST VIEW: show clients who have sent messages */
                        <div>
                            <p className="sk-section-label">MES CONVERSATIONS</p>
                            {activeClients.length === 0 ? (
                                <div className="sk-empty-state">
                                    <p className="sk-empty-state-icon">💬</p>
                                    <p>En attente de messages...</p>
                                    <small>Les clients qui vous envoient un message apparaîtront ici.</small>
                                </div>
                            ) : (
                                <ul className="sk-client-list">
                                    {activeClients.map(client => (
                                        <li
                                            key={client.id}
                                            className={`sk-client-item ${selectedChatUser?.id === client.id ? 'sk-client-item--selected' : ''}`}
                                            onClick={() => openChat(client.id, client.username, 'CLIENT')}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={(e) => { if (e.key === 'Enter') openChat(client.id, client.username, 'CLIENT'); }}
                                        >
                                            <div className="sk-client-avatar">{client.username.charAt(0).toUpperCase()}</div>
                                            <div className="sk-client-info">
                                                <strong>{client.username}</strong>
                                                <small>Cliquez pour ouvrir</small>
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

            </div>

            {/* ---- MAIN CHAT AREA ---- */}
            <div className="sk-main-area">
                {selectedChatUser && (
                    <button className="sk-mobile-back" onClick={() => setSelectedChatUser(null)}>
                        ← Retour
                    </button>
                )}
                {selectedChatUser ? (
                    <ChatWindow
                        currentUserId={userId}
                        targetUser={selectedChatUser}
                        isTherapist={isTherapist}
                        onNewMessage={isTherapist ? onNewClientMessage : null}
                    />
                ) : (
                    <div className="sk-welcome-state">
                        <h2 className="sk-welcome-title">Bienvenue, {username} !</h2>
                        <p className="sk-welcome-text">
                            {isTherapist
                                ? 'Sélectionnez une conversation dans la liste de gauche pour commencer à répondre.'
                                : 'Choisissez un thérapeute dans la liste de gauche pour démarrer une consultation.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}