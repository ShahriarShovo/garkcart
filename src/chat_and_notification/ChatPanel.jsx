import React from 'react';
import styles from './styles.module.css';

const ChatPanel = ({open, onClose}) => {
    const [messages, setMessages] = React.useState([
        {id: 'm1', side: 'admin', text: 'Ask us anything. We reply quickly.', time: ''}
    ]);
    const [text, setText] = React.useState('');
    const listRef = React.useRef(null);

    React.useEffect(() => {
        if(open && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [open, messages.length]);

    const send = () => {
        const t = text.trim();
        if(!t) return;
        const at = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        setMessages(prev => [...prev, {id: String(Math.random()), side: 'user', text: t, time: at}]);
        setText('');
        // Phase 1: simulate admin auto-reply just for UI feel
        setTimeout(() => {
            const at2 = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
            setMessages(prev => [...prev, {id: String(Math.random()), side: 'admin', text: 'Thanks! An agent will reply shortly.', time: at2}]);
        }, 600);
    };

    if(!open) return null;

    return (
        <div className={`card shadow rounded ${styles.panel}`} role="dialog" aria-modal="true" aria-label="Support chat">
            <div className="card-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <span className="fw-semibold">Support</span>
                    <i className="fa fa-circle text-secondary" style={{marginLeft: '20px'}} aria-label="Offline" title="Offline" />
                </div>
                <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-light" onClick={onClose}><i className="fa fa-minus" /></button>
                    <button type="button" className="btn btn-sm btn-light" onClick={onClose}><i className="fa fa-times" /></button>
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                <div ref={listRef} className={`px-3 py-3 d-flex flex-column ${styles.messagesArea}`} style={{gap: '20px'}}>
                    {messages.map(m => (
                        <div key={m.id} className={`d-flex ${m.side === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`rounded-3 px-3 py-2 ${styles.bubble} ${m.side === 'user' ? styles.userBubble : styles.adminBubble}`}>
                                <div>{m.text}</div>
                                {m.time && (
                                    <div className={`small mt-1 ${m.side === 'user' ? 'text-light' : 'text-muted'}`}>{m.time}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-top p-2">
                    <div className="input-group">
                        <textarea className="form-control" rows={1} placeholder="Type your message..." value={text} onChange={e => setText(e.target.value)} />
                        <button className="btn btn-primary" type="button" onClick={send}><i className="fa fa-paper-plane" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
