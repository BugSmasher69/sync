import React, { useState, useRef, useEffect } from 'react';

const ThreeDotMenu = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (e, action) => {
        e.stopPropagation();
        action();
        setIsOpen(false);
    };

    return (
        <div className="three-dot-menu" ref={menuRef} onClick={handleToggleMenu}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="4" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="12" r="1.5" />
            </svg>

            {isOpen && (
                <div className="menu-dropdown">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="menu-option"
                            onClick={(e) => handleOptionClick(e, option.action)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThreeDotMenu;