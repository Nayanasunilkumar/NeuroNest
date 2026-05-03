import React, { useState } from 'react';
import { User } from 'lucide-react';
import { resolveApiUrl } from '../../config/env';

const Avatar = ({ src, alt, className = '', style = {}, ...props }) => {
    const [imageError, setImageError] = useState(false);

    // Extract width/height from style if present to ensure fallback has dimensions
    const width = style.width || 40;
    const height = style.height || 40;
    
    // Calculate initials if alt is provided
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const resolvedSrc = src
        ? (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:'))
            ? src
            : resolveApiUrl(src)
        : null;

    if (!resolvedSrc || imageError) {
        return (
            <div 
                className={`flex items-center justify-center bg-slate-200 text-slate-500 ${className}`}
                style={{
                    ...style,
                    width,
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#E2E8F0', // slate-200 fallback
                    color: '#64748B', // slate-500 fallback
                }}
                {...props}
            >
                {alt ? (
                    <span style={{ fontSize: `calc(${typeof height === 'number' ? height : '40px'} * 0.4)`, fontWeight: 600 }}>
                        {getInitials(alt)}
                    </span>
                ) : (
                    <User size={typeof width === 'number' ? width * 0.6 : 24} />
                )}
            </div>
        );
    }

    return (
        <img
            src={resolvedSrc}
            alt={alt || 'Avatar'}
            className={`object-cover ${className}`}
            style={{
                objectFit: 'cover',
                ...style
            }}
            onError={() => setImageError(true)}
            {...props}
        />
    );
};

export default Avatar;
