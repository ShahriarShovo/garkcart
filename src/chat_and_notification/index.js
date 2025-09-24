import React from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatPanel from './ChatPanel';

export const FloatingChatWidget = () => {
    const [open, setOpen] = React.useState(false);
    const [unread, setUnread] = React.useState(0);

    React.useEffect(() => {
        if(!open) return;
        if(unread > 0) setUnread(0);
    }, [open]);

    return (
        <>
            {!open && <FloatingChatButton onOpen={() => setOpen(true)} unreadCount={unread} />}
            <ChatPanel open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export {default as FloatingChatButton} from './FloatingChatButton';
export {default as ChatPanel} from './ChatPanel';
