import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { useModuleConfig } from "../hooks/useModuleConfig";
import { getModulePathForRole, getModulesForRole } from "../modules/moduleRegistry";
import { useTheme } from "../context/ThemeContext";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";

/**
 * Premium "Dynamic Island" style navigation component.
 * Replaces the traditional sidebar with a sleek, horizontal, centered pill nav.
 */
const DynamicIslandNav = ({ role = "patient" }) => {
    const { enabledMap } = useModuleConfig();
    const { isDark: darkMode } = useTheme();
    const location = useLocation();
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const menuItems = getModulesForRole(role, { enabledMap, sidebarOnly: true });

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [menuItems]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="dynamic-island-container">
            <div className={`dynamic-island-wrapper ${darkMode ? 'dark' : 'light'}`}>
                {canScrollLeft && (
                    <button className="island-scroll-btn left" onClick={() => scroll('left')}>
                        <ChevronLeft size={16} />
                    </button>
                )}
                
                <nav 
                    className="island-nav" 
                    ref={scrollRef} 
                    onScroll={checkScroll}
                >
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const path = getModulePathForRole(item, role);
                        return (
                            <NavLink
                                key={item.key}
                                to={path}
                                className={({ isActive }) => `island-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="island-icon">
                                    <Icon size={18} strokeWidth={2.5} />
                                </div>
                                <span className="island-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {canScrollRight && (
                    <button className="island-scroll-btn right" onClick={() => scroll('right')}>
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>

            <style>{`
                .dynamic-island-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    padding: 0 1rem;
                    pointer-events: none; /* Let clicks pass through to background if needed */
                }

                .dynamic-island-wrapper {
                    display: flex;
                    align-items: center;
                    background: rgba(15, 23, 42, 0.85); /* Default dark mode slate */
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 999px;
                    padding: 6px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 
                                0 0 0 1px rgba(255, 255, 255, 0.05);
                    max-width: 90vw;
                    pointer-events: auto;
                    position: relative;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .dynamic-island-wrapper.light {
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 
                                0 0 0 1px rgba(0, 0, 0, 0.02);
                }

                .island-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 0 12px;
                }

                .island-nav::-webkit-scrollbar {
                    display: none;
                }

                .island-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 18px;
                    border-radius: 999px;
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    white-space: nowrap;
                    position: relative;
                }

                .light .island-item {
                    color: rgba(0, 0, 0, 0.6);
                }

                .island-item:hover {
                    color: rgba(255, 255, 255, 1);
                    background: rgba(255, 255, 255, 0.1);
                }

                .light .island-item:hover {
                    color: rgba(0, 0, 0, 1);
                    background: rgba(0, 0, 0, 0.05);
                }

                .island-item.active {
                    color: #fff;
                    background: #2563eb; /* Primary Blue */
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
                }

                .light .island-item.active {
                    color: #fff;
                    background: #2563eb;
                }
                
                /* Neon Accent Version (inspired by the Salesforce image) */
                .island-item.active {
                    background: #a3ff12; /* Neon Lime Green from ref image */
                    color: #000;
                    box-shadow: 0 4px 20px rgba(163, 255, 18, 0.4);
                }

                .island-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .island-label {
                    letter-spacing: -0.01em;
                }

                .island-scroll-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    opacity: 0.5;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    transition: opacity 0.3s;
                }

                .light .island-scroll-btn {
                    color: #000;
                }

                .island-scroll-btn:hover {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .island-label {
                        display: none;
                    }
                    .island-item {
                        padding: 12px;
                    }
                    .dynamic-island-wrapper {
                        padding: 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default DynamicIslandNav;
