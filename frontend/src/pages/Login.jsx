import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('users/login/', formData);

            // Stocker les tokens f localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('username', formData.username);
            // Redirect l Dashboard aw Home mn ba3d Login
            navigate('/home');
        } catch (err) {
            setError('Nom d\'utilisateur ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sk-auth-page">
            {/* Embedded styles: keeps this component fully self-contained in one file,
                while still allowing real responsive media queries (inline style objects
                alone can't do breakpoints). Class names are prefixed "sk-" to avoid
                clashing with the rest of the app. */}
            <style>{`
                .sk-auth-page {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #5B6660;
                    --sk-primary: #2F6F4E;
                    --sk-primary-hover: #275C41;
                    --sk-error: #B3261E;
                    --sk-error-bg: #FBEAE9;
                    --sk-focus-ring: rgba(47, 111, 78, 0.35);

                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 24px;
                    background-color: var(--sk-bg);
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .sk-auth-card {
                    width: 100%;
                    max-width: 380px;
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(31, 42, 36, 0.08);
                    padding: 32px 24px;
                    box-sizing: border-box;
                }

                .sk-auth-title {
                    margin: 0 0 24px;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--sk-text);
                    text-align: center;
                }

                .sk-field {
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                }

                .sk-field label {
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--sk-text-muted);
                }

                .sk-field input {
                    padding: 10px 12px;
                    font-size: 1rem;
                    color: var(--sk-text);
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 6px;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                    box-sizing: border-box;
                    width: 100%;
                }

                .sk-field input:focus {
                    outline: none;
                    border-color: var(--sk-primary);
                    box-shadow: 0 0 0 3px var(--sk-focus-ring);
                }

                .sk-error {
                    color: var(--sk-error);
                    background-color: var(--sk-error-bg);
                    font-size: 0.875rem;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }

                .sk-submit-btn {
                    width: 100%;
                    padding: 12px;
                    font-size: 1rem;
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

                .sk-auth-footer {
                    margin-top: 24px;
                    font-size: 0.875rem;
                    color: var(--sk-text-muted);
                    text-align: center;
                }

                .sk-auth-footer a {
                    color: var(--sk-primary);
                    font-weight: 500;
                    text-decoration: none;
                }

                .sk-auth-footer a:hover {
                    text-decoration: underline;
                }

                @media (prefers-reduced-motion: reduce) {
                    .sk-auth-page * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* Small phones */
                @media (max-width: 380px) {
                    .sk-auth-card {
                        padding: 24px 16px;
                        box-shadow: none;
                        border: none;
                    }
                    .sk-auth-title {
                        font-size: 1.3rem;
                    }
                }

                /* Larger desktop screens */
                @media (min-width: 1024px) {
                    .sk-auth-card {
                        max-width: 420px;
                        padding: 48px 32px;
                    }
                }
            `}</style>

            <form onSubmit={handleSubmit} className="sk-auth-card">
                <h2 className="sk-auth-title">Se Connecter à Sakina</h2>
                {error && <p className="sk-error">{error}</p>}

                <div className="sk-field">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="sk-field">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="sk-submit-btn">
                    {loading ? 'Connexion...' : 'Se Connecter'}
                </button>

                <p className="sk-auth-footer">
                    Pas encore de compte ? <Link to="/register">S'inscrire</Link>
                </p>
            </form>
        </div>
    );
}