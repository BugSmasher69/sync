import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ClipboardItem = ({ content, timestamp, device, type, onCopy, menu }) => {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  const renderIcon = () => {
    switch (type) {
      case 'text':
        return <span className="item-type-icon">T</span>;
      case 'file':
        return <span className="item-type-icon">F</span>;
      default:
        return null;
    }
  };
  
  const getDeviceIcon = () => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return '📱';
    } else if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
      return '📟';
    } else {
      return '💻';
    }
  };
  
  return (
    <div className="clipboard-item" onClick={onCopy}>
      <div className="clipboard-item-content">
        {renderIcon()}
        {content}
      </div>
      <div className="clipboard-item-meta">
        <div className="clipboard-item-time">{formattedTime}</div>
        <div className="clipboard-item-device">
          <span className="clipboard-item-device-icon">{getDeviceIcon()}</span>
          {device.split(' ')[0]}
        </div>
      </div>
      {menu}
    </div>
  );
};

export default ClipboardItem;