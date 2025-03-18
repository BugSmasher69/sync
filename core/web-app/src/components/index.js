import React, { useState, useEffect, useRef } from 'react';

// Header Component
export const Header = () => {
    return (
        <header className="header">
            <div className="header-logo">
                <span className="header-logo-icon">📋</span>
                <span className="header-title">Clipboard Sync</span>
            </div>
            <button className="header-button">
                <span>⚙️</span>
                <span>Settings</span>
            </button>
        </header>
    );
};

// Footer Component
export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <p>© {currentYear} Clipboard Sync - End-to-End Encrypted Clipboard Sharing</p>
        </footer>
    );
};

// Tab Component
export const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="tab-container">
            <div className="tab-header">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon && <span className="tab-button-icon">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// TabContent Component
export const TabContent = ({ id, activeTab, children }) => {
    return (
        <div className={`tab-content ${activeTab === id ? 'active' : ''}`}>
            {children}
        </div>
    );
};

// TextInput Component
export const TextInput = ({ value, onChange, onSend, disabled, placeholder }) => {
    return (
        <div className="text-input-container">
            <textarea
                className="text-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Type text to send to your clipboard..."}
                disabled={disabled}
            />
            <button
                className="text-input-button"
                onClick={onSend}
                disabled={!value.trim() || disabled}
            >
                <span className="text-input-button-icon">📋</span>
                Send to Clipboard
            </button>
        </div>
    );
};

// LinkInput Component
export const LinkInput = ({ value, onChange, onSend, disabled }) => {
    return (
        <div className="link-input-container">
            <input
                type="url"
                className="link-input-field"
                value={value}
                onChange={onChange}
                placeholder="Paste a URL here..."
                disabled={disabled}
            />
            <button
                className="text-input-button"
                onClick={onSend}
                disabled={!value.trim() || disabled}
            >
                <span className="text-input-button-icon">🔗</span>
                Send Link
            </button>
        </div>
    );
};

// FileUpload Component
export const FileUpload = ({ onFileSelected, disabled, selectedFile, onClearFile }) => {
    const fileInputRef = useRef(null);

    const handleClick = () => {
        if (fileInputRef.current && !disabled) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            onFileSelected(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const getFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('excel') || type.includes('sheet')) return '📊';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
        if (type.includes('zip') || type.includes('compressed')) return '🗜️';
        if (type.includes('text')) return '📝';
        return '📁';
    };

    return (
        <>
            <div
                className={`file-upload ${disabled ? 'disabled' : ''}`}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="file-upload-input"
                    onChange={handleFileChange}
                    disabled={disabled}
                />

                <div className="file-upload-icon">📎</div>
                <div className="file-upload-text">
                    Click or drop a file here to upload
                </div>
                <div className="file-upload-subtext">
                    Max file size: 50MB
                </div>
            </div>

            {selectedFile && (
                <div className="file-preview">
                    <div className="file-preview-icon">{getFileIcon(selectedFile.type)}</div>
                    <div className="file-preview-info">
                        <div className="file-preview-name">{selectedFile.name}</div>
                        <div className="file-preview-size">{getFileSize(selectedFile.size)}</div>
                    </div>
                    <div className="file-preview-remove" onClick={onClearFile}>✕</div>
                </div>
            )}

            {selectedFile && (
                <button
                    className="text-input-button"
                    onClick={() => onFileSelected(selectedFile, true)}
                    disabled={disabled}
                    style={{ marginTop: '1rem' }}
                >
                    <span className="text-input-button-icon">📤</span>
                    Send File
                </button>
            )}
        </>
    );
};

// ClipboardHistory Component
export const ClipboardHistory = ({ items, onItemClick }) => {
    if (!items || items.length === 0) {
        return (
            <div className="history-section">
                <div className="history-header">
                    <div className="history-title">Recent Activity</div>
                </div>
                <div className="empty-history">
                    <div className="empty-history-icon">📋</div>
                    <div className="empty-history-text">
                        Your recent clipboard activity will appear here
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="history-section">
            <div className="history-header">
                <div className="history-title">Recent Activity</div>
                <div className="history-actions">
                    <button className="history-action-button">Filter</button>
                    <button className="history-action-button">Clear</button>
                </div>
            </div>

            <div className="history-list">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="history-item"
                        onClick={() => onItemClick && onItemClick(item)}
                    >
                        <div className="history-item-content">
                            {item.content_preview}
                            <span className={`history-item-badge badge-${item.content_type}`}>
                                {item.content_type}
                            </span>
                        </div>
                        <div className="history-item-meta">
                            <div>{formatTimestamp(item.created_at)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Login Form Component
export const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onLogin(email, password);
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-logo">📋</div>
            <h1 className="login-title">Clipboard Sync</h1>
            <p className="login-subtitle">
                Securely sync your clipboard across all your devices with end-to-end encryption
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={`login-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>

            <div className="login-alternative">
                Don't have an account? <a href="#">Sign up</a>
            </div>
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

export default {
    Header,
    Footer,
    Tabs,
    TabContent,
    TextInput,
    LinkInput,
    FileUpload,
    ClipboardHistory,
    LoginForm,
    Toast,
    ToastContainer
};