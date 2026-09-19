import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios'; // Import your custom Axios instance

export default function HomeFeed() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const res = await API.get('social/posts/');
            setPosts(res.data);
        } catch (err) {
            console.error('Failed to load feed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await API.post('social/posts/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPosts([res.data, ...posts]);
            setContent('');
            setImage(null);
            // Reset file input element manually
            e.target.reset();
        } catch (err) {
            console.error('Error creating post:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="sk-feed-page">
            {/* Embedded styles: same "sk-" design system used across the app
                (colors, spacing, radius). Kept in this one file per your setup. */}
            <style>{`
                .sk-feed-page {
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

                .sk-feed-page * {
                    box-sizing: border-box;
                }

                .sk-feed-inner {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .sk-composer {
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(31, 42, 36, 0.06);
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .sk-composer h3 {
                    margin: 0 0 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--sk-text);
                }

                .sk-composer textarea {
                    width: 100%;
                    padding: 10px 12px;
                    margin-bottom: 12px;
                    font-size: 1rem;
                    font-family: inherit;
                    color: var(--sk-text);
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 6px;
                    resize: vertical;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }

                .sk-composer textarea:focus {
                    outline: none;
                    border-color: var(--sk-primary);
                    box-shadow: 0 0 0 3px var(--sk-focus-ring);
                }

                .sk-file-input {
                    display: block;
                    margin-bottom: 14px;
                    font-size: 0.9rem;
                    color: var(--sk-text-muted);
                }

                .sk-submit-btn {
                    padding: 10px 20px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #fff;
                    background-color: var(--sk-primary);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .sk-submit-btn:hover:not(:disabled) {
                    background-color: var(--sk-primary-hover);
                }

                .sk-submit-btn:focus-visible {
                    outline: 3px solid var(--sk-focus-ring);
                    outline-offset: 2px;
                }

                .sk-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .sk-feed-heading {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 16px;
                    color: var(--sk-text);
                }

                .sk-feed-status {
                    color: var(--sk-text-muted);
                    font-size: 0.95rem;
                }

                .sk-post-card {
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .sk-post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .sk-post-author {
                    font-weight: 600;
                    color: var(--sk-primary);
                    text-decoration: none;
                }

                .sk-post-author:hover {
                    text-decoration: underline;
                }

                .sk-post-time {
                    color: var(--sk-text-muted);
                    font-size: 0.8rem;
                    white-space: nowrap;
                }

                .sk-post-content {
                    margin: 0;
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

                @media (prefers-reduced-motion: reduce) {
                    .sk-feed-page * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* Small phones: tighten padding, stack post header */
                @media (max-width: 380px) {
                    .sk-feed-page {
                        padding: 16px 12px 32px;
                    }
                    .sk-composer,
                    .sk-post-card {
                        padding: 14px;
                        border-radius: 8px;
                    }
                    .sk-post-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 2px;
                    }
                }

                /* Desktop: a bit more breathing room */
                @media (min-width: 1024px) {
                    .sk-feed-page {
                        padding: 40px 16px 64px;
                    }
                    .sk-composer {
                        padding: 24px;
                    }
                }
            `}</style>

            <div className="sk-feed-inner">
                {/* Create Post Card */}
                <div className="sk-composer">
                    <h3>Créer une publication</h3>
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            rows="3"
                            placeholder="Quoi de neuf ?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="sk-file-input"
                        />
                        <div>
                            <button type="submit" disabled={submitting} className="sk-submit-btn">
                                {submitting ? 'Publication...' : 'Publier'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Posts Feed */}
                <h2 className="sk-feed-heading">Fil d'actualité</h2>
                {loading ? (
                    <p className="sk-feed-status">Chargement du fil...</p>
                ) : posts.length === 0 ? (
                    <p className="sk-feed-status">Aucune publication pour le moment.</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="sk-post-card">
                            <div className="sk-post-header">
                                <Link to={`/profile/${post.author}`} className="sk-post-author">
                                    @{post.author_username}
                                </Link>
                                <small className="sk-post-time">{new Date(post.created_at).toLocaleString()}</small>
                            </div>
                            <p className="sk-post-content">{post.content}</p>
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post attachment"
                                    className="sk-post-image"
                                />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}