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

    if (loading) {
        return (
            <div className="sk-profile-status-page">
                <style>{`
                    .sk-profile-status-page {
                        --sk-bg: #F6F4EE;
                        --sk-text-muted: #5B6660;
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        padding-top: 60px;
                        background-color: var(--sk-bg);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        color: var(--sk-text-muted);
                        box-sizing: border-box;
                    }
                `}</style>
                <p>Chargement de votre profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="sk-profile-status-page">
                <style>{`
                    .sk-profile-status-page {
                        --sk-bg: #F6F4EE;
                        --sk-error: #B3261E;
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        padding-top: 60px;
                        background-color: var(--sk-bg);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        color: var(--sk-error);
                        box-sizing: border-box;
                    }
                `}</style>
                <p>Erreur de chargement du profil.</p>
            </div>
        );
    }

    return (
        <div className="sk-profile-page">
            {/* Same "sk-" design system used across the app, embedded here to
                keep this component self-contained. */}
            <style>{`
                .sk-profile-page {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #5B6660;
                    --sk-primary: #2F6F4E;

                    width: 100%;
                    min-height: 100vh;
                    background-color: var(--sk-bg);
                    box-sizing: border-box;
                    padding: 24px 16px 48px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: var(--sk-text);
                }

                .sk-profile-page * {
                    box-sizing: border-box;
                }

                .sk-profile-inner {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .sk-profile-header {
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(31, 42, 36, 0.06);
                    padding: 24px 20px;
                    margin-bottom: 24px;
                }

                .sk-profile-title {
                    margin: 0 0 16px;
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: var(--sk-text);
                }

                .sk-profile-row {
                    margin: 0 0 8px;
                    font-size: 0.95rem;
                    color: var(--sk-text);
                }

                .sk-profile-row:last-child {
                    margin-bottom: 0;
                }

                .sk-profile-row strong {
                    color: var(--sk-text-muted);
                    font-weight: 600;
                    margin-right: 4px;
                }

                .sk-posts-heading {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 16px;
                    color: var(--sk-text);
                }

                .sk-post-card {
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .sk-post-time {
                    color: var(--sk-text-muted);
                    font-size: 0.8rem;
                }

                .sk-post-content {
                    margin: 8px 0 0;
                    line-height: 1.5;
                    word-wrap: break-word;
                }

                .sk-post-image {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    margin-top: 10px;
                    display: block;
                }

                .sk-empty-posts {
                    color: var(--sk-text-muted);
                }

                @media (prefers-reduced-motion: reduce) {
                    .sk-profile-page * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* Small phones */
                @media (max-width: 380px) {
                    .sk-profile-page {
                        padding: 16px 12px 32px;
                    }
                    .sk-profile-header,
                    .sk-post-card {
                        padding: 16px 14px;
                        border-radius: 8px;
                    }
                }

                /* Desktop */
                @media (min-width: 1024px) {
                    .sk-profile-page {
                        padding: 40px 16px 64px;
                    }
                    .sk-profile-header {
                        padding: 28px 24px;
                    }
                }
            `}</style>

            <div className="sk-profile-inner">
                {/* Header */}
                <div className="sk-profile-header">
                    <h2 className="sk-profile-title">Mon Profil</h2>
                    <p className="sk-profile-row"><strong>Nom d'utilisateur:</strong> @{profile.username}</p>
                    <p className="sk-profile-row"><strong>Email:</strong> {profile.email}</p>
                </div>

                {/* My Posts */}
                <h3 className="sk-posts-heading">Mes Publications ({profile.posts ? profile.posts.length : 0})</h3>
                {profile.posts && profile.posts.length > 0 ? (
                    profile.posts.map((post) => (
                        <div key={post.id} className="sk-post-card">
                            <small className="sk-post-time">{new Date(post.created_at).toLocaleString()}</small>
                            <p className="sk-post-content">{post.content}</p>
                            {post.image && (
                                <img src={post.image} alt="Post" className="sk-post-image" />
                            )}
                        </div>
                    ))
                ) : (
                    <p className="sk-empty-posts">Vous n'avez encore rien publié.</p>
                )}
            </div>
        </div>
    );
}