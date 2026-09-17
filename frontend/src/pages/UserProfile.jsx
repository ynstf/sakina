import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            const res = await API.get(`social/profile/${id}/`);
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to load user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = () => {
        // Navigates to dashboard passing target user state
        navigate('/dashboard', { state: { selectedUser: profile } });
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Chargement du profil...</p>;
    if (!profile) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Utilisateur introuvable.</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Header & Chat Button */}
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>@{profile.username}</h2>
                    <p style={{ color: '#666' }}>{profile.email}</p>
                </div>
                <button
                    onClick={handleSendMessage}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Envoyer un message
                </button>
            </div>

            {/* Target User Posts */}
            <h3>Publications de @{profile.username}</h3>
            {profile.posts && profile.posts.length > 0 ? (
                profile.posts.map((post) => (
                    <div key={post.id} style={{ padding: '16px', marginBottom: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <small>{new Date(post.created_at).toLocaleString()}</small>
                        <p>{post.content}</p>
                        {post.image && (
                            <img src={post.image} alt="Post" style={{ maxWidth: '100%', borderRadius: '6px' }} />
                        )}
                    </div>
                ))
            ) : (
                <p>Cet utilisateur n'a publié aucun message.</p>
            )}
        </div>
    );
}