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
        <div className="feed-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Create Post Card */}
            <div className="card" style={{ padding: '16px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>Créer une publication</h3>
                <form onSubmit={handleCreatePost}>
                    <textarea
                        rows="3"
                        placeholder="Quoi de neuf ?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ marginBottom: '10px' }}
                    />
                    <div>
                        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                            {submitting ? 'Publication...' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts Feed */}
            <h2>Fil d'actualité</h2>
            {loading ? (
                <p>Chargement du fil...</p>
            ) : posts.length === 0 ? (
                <p>Aucune publication pour le moment.</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="post-card" style={{ padding: '16px', marginBottom: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Link to={`/profile/${post.author}`} style={{ fontWeight: 'bold', textDecoration: 'none' }}>
                                @{post.author_username}
                            </Link>
                            <small>{new Date(post.created_at).toLocaleString()}</small>
                        </div>
                        <p>{post.content}</p>
                        {post.image && (
                            <img
                                src={post.image}
                                alt="Post attachment"
                                style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '8px' }}
                            />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}