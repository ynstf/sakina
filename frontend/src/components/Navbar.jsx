import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // mobile menu toggle (UI-only, no business logic)

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="sk-navbar" data-menu-open={menuOpen}>
            {/* Same "sk-" design system used across the app, embedded here.
                On mobile, links + logout collapse into a dropdown toggled by
                the hamburger button, driven by menuOpen above. */}
            <style>{`
                .sk-navbar {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #4B5563;
                    --sk-primary: #2F6F4E;
                    --sk-danger-bg: #FBEAE9;
                    --sk-danger-text: #A32E26;
                    --sk-danger-border: #E9BAB5;
                    --sk-focus-ring: rgba(47, 111, 78, 0.35);

                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 24px;
                    background-color: var(--sk-surface);
                    border-bottom: 1px solid var(--sk-border);
                    margin-bottom: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    box-sizing: border-box;
                }

                .sk-navbar * {
                    box-sizing: border-box;
                }

                .sk-navbar-brand {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--sk-primary);
                    white-space: nowrap;
                }

                .sk-navbar-links {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    flex: 1;
                }

                .sk-navbar-link {
                    text-decoration: none;
                    color: var(--sk-text-muted);
                    font-weight: 500;
                    padding-bottom: 4px;
                    border-bottom: 2px solid transparent;
                }

                .sk-navbar-link:hover {
                    color: var(--sk-text);
                }

                .sk-navbar-link--active {
                    color: var(--sk-primary);
                    font-weight: 700;
                    border-bottom-color: var(--sk-primary);
                }

                .sk-navbar-link:focus-visible,
                .sk-logout-btn:focus-visible,
                .sk-menu-toggle:focus-visible {
                    outline: 3px solid var(--sk-focus-ring);
                    outline-offset: 2px;
                }

                .sk-logout-btn {
                    background-color: var(--sk-danger-bg);
                    color: var(--sk-danger-text);
                    border: 1px solid var(--sk-danger-border);
                    padding: 8px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    transition: background-color 0.15s ease;
                }

                .sk-logout-btn:hover {
                    background-color: #F6D9D6;
                }

                .sk-menu-toggle {
                    display: none;
                    background: none;
                    border: 1px solid var(--sk-border);
                    border-radius: 6px;
                    padding: 6px 10px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    line-height: 1;
                    color: var(--sk-text);
                }

                @media (prefers-reduced-motion: reduce) {
                    .sk-navbar * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* ---- Mobile: collapse links + logout into a dropdown ---- */
                @media (max-width: 640px) {
                    .sk-menu-toggle {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .sk-navbar-links {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        background-color: var(--sk-surface);
                        border-bottom: 1px solid var(--sk-border);
                        box-shadow: 0 8px 16px rgba(31, 42, 36, 0.08);
                        padding: 8px 0;
                        z-index: 20;
                    }

                    .sk-navbar[data-menu-open="true"] .sk-navbar-links {
                        display: flex;
                    }

                    .sk-navbar-link {
                        padding: 12px 24px;
                        border-bottom: none;
                        border-left: 3px solid transparent;
                    }

                    .sk-navbar-link--active {
                        background-color: #F0F7F2;
                        border-left-color: var(--sk-primary);
                        border-bottom: none;
                    }

                    .sk-navbar-logout-row {
                        padding: 4px 24px 12px;
                    }

                    .sk-navbar-logout-row .sk-logout-btn {
                        width: 100%;
                    }

                    .sk-navbar > .sk-logout-btn {
                        display: none;
                    }
                }

                @media (min-width: 641px) {
                    .sk-navbar-logout-row {
                        display: none;
                    }
                }
            `}</style>

            <div className="sk-navbar-brand">Sakina</div>

            <button
                className="sk-menu-toggle"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? '✕' : '☰'}
            </button>

            <div className="sk-navbar-links">
                <NavLink
                    to="/home"
                    onClick={closeMenu}
                    className={({ isActive }) => `sk-navbar-link ${isActive ? 'sk-navbar-link--active' : ''}`}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className={({ isActive }) => `sk-navbar-link ${isActive ? 'sk-navbar-link--active' : ''}`}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/me"
                    onClick={closeMenu}
                    className={({ isActive }) => `sk-navbar-link ${isActive ? 'sk-navbar-link--active' : ''}`}
                >
                    Me
                </NavLink>

                {/* Logout shown inside the dropdown on mobile only */}
                <div className="sk-navbar-logout-row">
                    <button onClick={handleLogout} className="sk-logout-btn">
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Logout shown inline on desktop only */}
            <button onClick={handleLogout} className="sk-logout-btn">
                Déconnexion
            </button>
        </nav>
    );
}