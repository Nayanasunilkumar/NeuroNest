import React from 'react';
import { Check, CheckCheck, Download, Paperclip } from 'lucide-react';
import { resolveApiUrl } from '../../config/env';
import { formatTimeIST } from '../../utils/time';
import '../../styles/patient-chat.css';

const URL_PATTERN = /(https?:\/\/[^\s]+|\/api\/chat\/uploads\/[^\s]+|\/uploads\/[^\s]+)/i;

const extractFileName = (value = '') => {
    const trimmed = value.split('?')[0];
    const pieces = trimmed.split('/');
    return pieces[pieces.length - 1] || 'file';
};

const truncateMiddle = (value = '', max = 46) => {
    if (value.length <= max) return value;
    const head = value.slice(0, 24);
    const tail = value.slice(-14);
    return `${head}...${tail}`;
};

const getMessageFileUrl = (content = '') => {
    if (!URL_PATTERN.test(content)) return null;
    return resolveApiUrl(content.trim());
};

const MessageBubble = ({ message, isMe }) => {
    const content = message?.content || '';
    const isFileMessage = message?.type === 'file' || content.includes('/uploads/');
    const fileUrl = getMessageFileUrl(content);
    const fileName = fileUrl ? extractFileName(fileUrl) : null;

    return (
        <div className={`nexus-msg-row ${isMe ? 'sent' : 'received'}`}>
            <div className="nexus-bubble">
                {isFileMessage && fileUrl ? (
                    <div className="nexus-file-card">
                        <div className="nexus-file-topline">
                            <Paperclip size={14} />
                            <span className="nexus-file-title">Uploaded File</span>
                        </div>
                        <span className="nexus-file-name" title={fileName}>{truncateMiddle(fileName)}</span>
                        <a
                            className="nexus-file-link"
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={fileUrl}
                        >
                            <Download size={14} />
                            <span>Download</span>
                        </a>
                    </div>
                ) : (
                    <span className="nexus-bubble-text">{content}</span>
                )}
            </div>

            <span className="nexus-msg-meta">
                <span className="nexus-msg-time">
                    {formatTimeIST(message.created_at)}
                </span>
                {isMe && (
                    <span className="nexus-read-ticks">
                        {message.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                    </span>
                )}
            </span>
        </div>
    );
};

export default MessageBubble;
