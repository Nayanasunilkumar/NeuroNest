import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

const AdminHeader = ({ setIsOpen, title = "Admin Console" }) => {
    return (
        <header className="admin-console-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2.5rem',
            background: 'var(--admin-panel-bg)',
            borderBottom: '1px solid var(--admin-border)',
            backdropFilter: 'var(--admin-glass)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button 
                    onClick={() => setIsOpen(true)}
                    className="sidebar-trigger"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--admin-text-main)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                >
                    <Menu size={20} />
                </button>
                <h2 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 800, 
                    color: 'var(--admin-text-main)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>{title}</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="header-status-pill" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '50px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#10b981',
                    textTransform: 'uppercase'
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    System Online
                </div>
                
                <button className="header-icon-btn" style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                    <Bell size={18} />
                </button>
                
                <div style={{ width: '1px', height: '20px', background: 'var(--admin-border)' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>KIMS Admin</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>Superuser</div>
                    </div>
                    <div style={{ 
                        width: 35, 
                        height: 35, 
                        borderRadius: '10px', 
                        background: 'var(--admin-accent)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <User size={18} fill="currentColor" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
