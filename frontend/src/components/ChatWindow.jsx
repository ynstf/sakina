import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatWindow({ currentUserId, targetUser, isTherapist }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // Determine client and therapist IDs based on roles
    const clientId = isTherapist ? targetUser.id : currentUserId;
    const therapistId = isTherapist ? currentUserId : targetUser.id;

    useEffect(() => {
        setMessages([]);
        setLoading(true);
        setIsConnected(false);
        
        fetchHistory();
        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [targetUser.id, currentUserId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${import.meta.env.VITE_CHAT_API_URL}chat/history/client/${clientId}/therapist/${therapistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to load chat history", error);
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        const token = localStorage.getItem('access_token');
        const wsUrl = `${import.meta.env.VITE_WS_URL}chat/client/${clientId}/therapist/${therapistId}?token=${token}`;
        
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
            setIsConnected(true);
            console.log("WebSocket connected");
        };
        
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.system) {
                    // System message
                    setMessages(prev => [...prev, { id: Date.now(), system: true, message_text: data.message }]);
                } else {
                    // Normal message
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        sender_id: data.sender_id,
                        message_text: data.text,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (err) {
                console.error("Error parsing websocket message", err);
            }
        };
        
        ws.current.onclose = () => {
            setIsConnected(false);
            console.log("WebSocket disconnected");
        };
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !isConnected) return;

        // Send via WebSocket
        ws.current.send(inputText);
        setInputText('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerInfo}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                        Conversation avec {targetUser.name || targetUser.username}
                    </h3>
                    <div style={styles.status}>
                        <span style={{ 
                            display: 'inline-block', 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: isConnected ? '#4caf50' : '#f44336',
                            marginRight: '6px'
                        }}></span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            {isConnected ? 'En ligne' : 'Déconnecté'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.messagesArea}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <Loader2 className="spinner" size={24} color="#2e7d32" />
                        <p>Chargement des messages...</p>
                    </div>
                ) : (
                    <>
                        {messages.length === 0 && (
                            <div style={styles.emptyMessages}>
                                <p>Envoyez un message pour commencer la discussion.</p>
                            </div>
                        )}
                        
                        {messages.map((msg, idx) => {
                            if (msg.system) {
                                return (
                                    <div key={idx} style={styles.systemMessage}>
                                        <small>{msg.message_text}</small>
                                    </div>
                                );
                            }

                            const isMe = String(msg.sender_id) === String(currentUserId);
                            return (
                                <div key={idx} style={styles.messageRow(isMe)}>
                                    <div style={styles.messageBubble(isMe)}>
                                        <div style={styles.messageText}>{msg.message_text}</div>
                                        {msg.timestamp && (
                                            <div style={styles.messageTime(isMe)}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <form style={styles.inputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    style={styles.input}
                    disabled={!isConnected}
                />
                <button 
                    type="submit" 
                    style={styles.sendButton(!inputText.trim() || !isConnected)} 
                    disabled={!inputText.trim() || !isConnected}
                >
                    <Send size={18} />
                </button>
            </form>
            
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spinner { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#fff' },
    header: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    headerInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    status: { display: 'flex', alignItems: 'center' },
    messagesArea: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '15px' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' },
    emptyMessages: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: '20px' },
    systemMessage: { textAlign: 'center', margin: '10px 0', color: '#888' },
    messageRow: (isMe) => ({
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        width: '100%'
    }),
    messageBubble: (isMe) => ({
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '16px',
        borderBottomRightRadius: isMe ? '4px' : '16px',
        borderBottomLeftRadius: !isMe ? '4px' : '16px',
        backgroundColor: isMe ? '#2e7d32' : '#fff',
        color: isMe ? '#fff' : '#333',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
    }),
    messageText: { fontSize: '15px', lineHeight: '1.4' },
    messageTime: (isMe) => ({
        fontSize: '11px',
        color: isMe ? 'rgba(255,255,255,0.7)' : '#999',
        alignSelf: 'flex-end',
        marginTop: '4px'
    }),
    inputArea: { padding: '15px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '12px 15px', borderRadius: '24px', border: '1px solid #ddd', outline: 'none', fontSize: '15px', backgroundColor: '#f9f9f9' },
    sendButton: (disabled) => ({
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: disabled ? '#ccc' : '#2e7d32',
        color: '#fff',
        border: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s'
    })
};
