import React, { useState, useEffect } from 'react';

// Container Component
export const Container = ({ children }) => {
    return (
        <div className="container">
            <TitleBar />
            {children}
        </div>
    );
};

// TitleBar Component (macOS style)
export const TitleBar = () => {
    return (
        <div className="titlebar">
            <div className="window-controls">
                <div className="window-control-button close-button" onClick={() => window.electron.closeWindow()} />
                <div className="window-control-button minimize-button" onClick={() => window.electron.minimizeWindow()} />
                <div className="window-control-button maximize-button" onClick={() => window.electron.maximizeWindow()} />
            </div>
            <div className="titlebar-title">Clipboard Sync</div>
            <div style={{ width: 60 }} /> {/* Spacer for balance */}
        </div>
    );
};

// Sidebar Component
export const Sidebar = ({ children }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <a href="#" className="sidebar-logo">
                    <span className="logo-icon">📋</span>
                    <span className="logo-text">Clipboard Sync</span>
                </a>
            </div>
            {children}
            <UserProfile />
        </div>
    );
};

// User Profile Component
export const UserProfile = () => {
    // This would come from auth context in a real app
    const user = {
        name: "John Doe",
        email: "john@example.com",
        avatar: "JD"
    };

    return (
        <div className="sidebar-footer">
            <div className="user-profile">
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                </div>
            </div>
        </div>
    );
};

// Content Component
export const Content = ({ children }) => {
    return <div className="content">{children}</div>;
};

// Header Component
export const Header = ({ children }) => {
    return <div className="header">{children}</div>;
};

// SidebarItem Component
export const SidebarItem = ({ icon, label, selected, onClick }) => {
    return (
        <div
            className={`sidebar-item ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="sidebar-item-icon">
                {renderIcon(icon)}
            </div>
            <div className="sidebar-item-label">{label}</div>
        </div>
    );
};

// SidebarSection Component
export const SidebarSection = ({ title, children }) => {
    return (
        <div className="sidebar-section">
            {title && <div className="sidebar-section-title">{title}</div>}
            {children}
        </div>
    );
};

// SearchBar Component
export const SearchBar = ({ value, onChange, placeholder }) => {
    return (
        <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
                type="text"
                className="search-bar"
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Search clipboard history..."}
            />
        </div>
    );
};

// HeaderButton Component
export const HeaderButton = ({ icon, onClick, tooltip }) => {
    return (
        <button
            className="header-button"
            onClick={onClick}
            title={tooltip}
        >
            {renderIcon(icon)}
        </button>
    );
};

// ClipboardItem Component
export const ClipboardItem = ({ content, timestamp, device, type, onCopy, menu }) => {
    return (
        <div className="clipboard-item" onClick={onCopy}>
            <div className="clipboard-item-type">
                {renderTypeIcon(type)}
            </div>
            <div className="clipboard-item-content">
                {content}
            </div>
            <div className="clipboard-item-meta">
                <div className="clipboard-item-timestamp">
                    {formatTimestamp(timestamp)}
                </div>
                <div className="clipboard-item-device">
                    {renderDeviceIcon(device)}
                    <div>{getDeviceName(device)}</div>
                </div>
            </div>
            {menu}
        </div>
    );
};

// ThreeDotMenu Component
export const ThreeDotMenu = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = () => setIsOpen(false);
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="three-dot-menu" onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }}>
            <div>⋮</div>

            {isOpen && (
                <div className="menu-dropdown">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="menu-option"
                            onClick={(e) => {
                                e.stopPropagation();
                                option.action();
                                setIsOpen(false);
                            }}
                        >
                            <span className="menu-option-icon">{option.icon}</span>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Section Header Component
export const SectionHeader = ({ title, children }) => {
    return (
        <div className="section-header">
            <h2 className="section-title">{title}</h2>
            {children}
        </div>
    );
};

// ViewOptions Component
export const ViewOptions = ({ options, activeView, onChange }) => {
    return (
        <div className="view-options">
            {options.map((option) => (
                <div
                    key={option.value}
                    className={`view-option ${activeView === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};

// EmptyState Component
export const EmptyState = ({ message, description, icon }) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon || "📋"}</div>
            <div className="empty-state-message">{message}</div>
            {description && <div className="empty-state-description">{description}</div>}
        </div>
    );
};

// Toast Component
export const Toast = ({ type = 'info', title, message, onClose }) => {
    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {type === 'success' && '✅'}
                {type === 'error' && '❌'}
                {type === 'warning' && '⚠️'}
                {type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-content">
                <div className="toast-title">{title}</div>
                <div className="toast-message">{message}</div>
            </div>
            <div className="toast-close" onClick={onClose}>✕</div>
        </div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [] }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={toast.onClose}
                />
            ))}
        </div>
    );
};

// Helper functions
function renderIcon(icon) {
    // This would ideally use an icon library
    const icons = {
        clipboard: "📋",
        text: "📝",
        file: "📄",
        link: "🔗",
        sync: "🔄",
        "sync-off": "⏸️",
        settings: "⚙️",
        refresh: "🔄",
        filter: "🔍",
        sort: "↕️",
        add: "➕",
        delete: "🗑️",
        edit: "✏️",
        share: "📤",
        search: "🔍",
        close: "✕",
        check: "✓",
        warning: "⚠️",
        info: "ℹ️",
        success: "✅",
        error: "❌",
        user: "👤",
        lock: "🔒",
        unlock: "🔓",
        history: "⏱️"
    };

    return icons[icon] || icon || "•";
}

function renderTypeIcon(type) {
    switch (type) {
        case 'text':
            return "📝";
        case 'file':
            return "📄";
        case 'link':
            return "🔗";
        default:
            return "📋";
    }
}

function renderDeviceIcon(device) {
    if (typeof device !== 'string') return "💻";

    if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("ios")) {
        return "📱";
    } else if (device.toLowerCase().includes("android")) {
        return "📱";
    } else if (device.toLowerCase().includes("macintosh") || device.toLowerCase().includes("mac os")) {
        return "🖥️";
    } else if (device.toLowerCase().includes("windows")) {
        return "💻";
    } else if (device.toLowerCase().includes("linux")) {
        return "🐧";
    } else if (device.toLowerCase().includes("ipad")) {
        return "📱";
    } else {
        return "💻";
    }
}

function getDeviceName(device) {
    if (typeof device !== 'string') return "Unknown Device";

    // Extract device name from user agent
    if (device.toLowerCase().includes("iphone")) {
        return "iPhone";
    } else if (device.toLowerCase().includes("ipad")) {
        return "iPad";
    } else if (device.toLowerCase().includes("android")) {
        return "Android";
    } else if (device.toLowerCase().includes("macintosh") || device.toLowerCase().includes("mac os")) {
        return "Mac";
    } else if (device.toLowerCase().includes("windows")) {
        return "Windows";
    } else if (device.toLowerCase().includes("linux")) {
        return "Linux";
    } else {
        return "Unknown Device";
    }
}

function formatTimestamp(timestamp) {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) {
        return "Just now";
    } else if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffMins < 24 * 60) {
        return `${Math.round(diffMins / 60)}h ago`;
    } else if (diffMins < 48 * 60) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Main Content Component
export const MainContent = ({ children }) => {
    return <div className="main-content">{children}</div>;
};

// ClipboardGrid Component
export const ClipboardGrid = ({ children }) => {
    return <div className="clipboard-grid">{children}</div>;
};

export default {
    Container,
    TitleBar,
    Sidebar,
    SidebarSection,
    SidebarItem,
    Content,
    Header,
    SearchBar,
    HeaderButton,
    ClipboardItem,
    ThreeDotMenu,
    SectionHeader,
    ViewOptions,
    EmptyState,
    Toast,
    ToastContainer,
    MainContent,
    ClipboardGrid,
    UserProfile
};