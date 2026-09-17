import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyProfile();
    }, []);

    const fetchMyProfile = async () => {
        try {
            const res = await API.get('social/me/');
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Chargement de votre profil...</p>;
    if (!profile) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Erreur de chargement du profil.</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Mon Profil</h2>
                <p><strong>Nom d'utilisateur:</strong> @{profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
            </div>

            {/* My Posts */}
            <h3>Mes Publications ({profile.posts ? profile.posts.length : 0})</h3>
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
                <p>Vous n'avez encore rien publié.</p>
            )}
        </div>
    );
}