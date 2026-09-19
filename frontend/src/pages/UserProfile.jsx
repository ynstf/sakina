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

    if (loading) {
        return (
            <div className="sk-uprofile-status-page">
                <style>{`
                    .sk-uprofile-status-page {
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
                <p>Chargement du profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="sk-uprofile-status-page">
                <style>{`
                    .sk-uprofile-status-page {
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
                <p>Utilisateur introuvable.</p>
            </div>
        );
    }

    return (
        <div className="sk-uprofile-page">
            {/* Same "sk-" design system used across the app, embedded here to
                keep this component self-contained. All headings get an
                explicit color to avoid inheriting a stray global h2/h3 rule. */}
            <style>{`
                .sk-uprofile-page {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #5B6660;
                    --sk-primary: #2F6F4E;
                    --sk-primary-hover: #275C41;
                    --sk-focus-ring: rgba(47, 111, 78, 0.35);

                    width: 100%;
                    min-height: 100vh;
                    background-color: var(--sk-bg);
                    box-sizing: border-box;
                    padding: 24px 16px 48px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: var(--sk-text);
                }

                .sk-uprofile-page * {
                    box-sizing: border-box;
                }

                .sk-uprofile-inner {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .sk-uprofile-header {
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(31, 42, 36, 0.06);
                    padding: 20px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                }

                .sk-uprofile-name {
                    margin: 0 0 4px;
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: var(--sk-text);
                    word-break: break-word;
                }

                .sk-uprofile-email {
                    margin: 0;
                    color: var(--sk-text-muted);
                    font-size: 0.9rem;
                    word-break: break-word;
                }

                .sk-message-btn {
                    padding: 10px 18px;
                    background-color: var(--sk-primary);
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: background-color 0.15s ease;
                }

                .sk-message-btn:hover {
                    background-color: var(--sk-primary-hover);
                }

                .sk-message-btn:focus-visible {
                    outline: 3px solid var(--sk-focus-ring);
                    outline-offset: 2px;
                }

                .sk-uprofile-posts-heading {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 16px;
                    color: var(--sk-text);
                    word-break: break-word;
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
                    .sk-uprofile-page * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* Small phones: stack the header so the button never squeezes the name */
                @media (max-width: 480px) {
                    .sk-uprofile-page {
                        padding: 16px 12px 32px;
                    }
                    .sk-uprofile-header {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 16px 14px;
                        border-radius: 8px;
                    }
                    .sk-message-btn {
                        width: 100%;
                    }
                    .sk-post-card {
                        padding: 14px;
                        border-radius: 8px;
                    }
                }

                /* Desktop */
                @media (min-width: 1024px) {
                    .sk-uprofile-page {
                        padding: 40px 16px 64px;
                    }
                    .sk-uprofile-header {
                        padding: 24px;
                    }
                }
            `}</style>

            <div className="sk-uprofile-inner">
                {/* Header & Chat Button */}
                <div className="sk-uprofile-header">
                    <div>
                        <h2 className="sk-uprofile-name">@{profile.username}</h2>
                        <p className="sk-uprofile-email">{profile.email}</p>
                    </div>
                    <button onClick={handleSendMessage} className="sk-message-btn">
                        Envoyer un message
                    </button>
                </div>

                {/* Target User Posts */}
                <h3 className="sk-uprofile-posts-heading">Publications de @{profile.username}</h3>
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
                    <p className="sk-empty-posts">Cet utilisateur n'a publié aucun message.</p>
                )}
            </div>
        </div>
    );
}