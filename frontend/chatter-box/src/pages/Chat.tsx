// src/components/MainContainerUI.tsx

import React, { useContext, useEffect, useRef, useState } from "react";
import {
    MainContainer,
    Sidebar,
    Search,
    ConversationList,
    Conversation,
    Avatar,
    ChatContainer,
    ConversationHeader,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
    VoiceCallButton,
    VideoCallButton,
    EllipsisButton
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { AuthContext } from "../context/AuthContext";
import { fetchChatUsers, fetchMessagesWithUser, type ChatMessage, } from "../api/chat";
import { useSocket } from "../context/SocketContext";


interface User {
    id: string;
    username: string;
    isOnline: boolean;
    lastMessage?: string;
    unreadCount: number;
}


const MainContainerUI: React.FC = () => {
    const { userId: currentUserId } = useContext(AuthContext)!;
    //socket 
    const socket = useSocket();

    const [users, setUsers] = useState<User[]>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);

    // message stats below
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingText, setTypingText] = useState<string | undefined>(undefined);


    // refs
    const typingTimeout = useRef<number | undefined>(undefined);


    // fetch users on mount
    useEffect(() => {
        fetchChatUsers()
            .then(fetched => {
                // Map server shape → UI shape
                const uiUsers = fetched.map(u => ({
                    id: u._id,
                    username: u.username,
                    isOnline: false,               // it  update via socket below
                    lastMessage: u.lastMessage?.content,
                    unreadCount: u.unreadCount
                }));
                setUsers(uiUsers);
            })
            .catch(err => {
                console.error('Failed to fetch chat users', err);
            });
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for onlineUsers updates
        const handleOnlineUsers = (ids: string[]) => {
            setUsers(prev =>
                prev.map(u => ({ ...u, isOnline: ids.includes(u.id) }))
            );
        };
        socket.on('onlineUsers', handleOnlineUsers);

        return () => {
            socket.off('onlineUsers', handleOnlineUsers);
        };
    }, [socket]);


    // Handle selecting a user
    const handleSelectUser = async (user: User) => {
        setActiveUser(user);
        console.log(`Selected user: ${user.username}`);
        console.log(`Current user: ${currentUserId}`);
        fetchMessagesWithUser(user.id)
            .then(msgs => setMessages(msgs))
            .catch(err => console.error('Failed to fetch messages', err));
        // … load messages, etc.
    };

    useEffect(() => {
        if (!socket) return;

        function handleReceive(msg: ChatMessage) {
            setMessages(prev => [...prev, msg]);
        }

        socket.on('receiveMessage', handleReceive);
        return () => {
            socket.off('receiveMessage', handleReceive);
        };
    }, [socket]);


    //Typing indicator
    useEffect(() => {
        if (!socket) return;
        const handler = ({ from, typing }: { from: string; typing: boolean }) => {
            if (!activeUser || from !== activeUser.id) return;
            setTypingText(typing ? `${activeUser.username} is typing…` : undefined);
        };
        socket.on("typing", handler);
        return () => {
            socket.off("typing", handler);
        };
    }, [socket, activeUser])

    const handleSend = (text: string) => {
        if (!socket || !activeUser) return;
        socket.emit(
            "sendMessage",
            { to: activeUser.id, text },
            (ack: any) => {
                if (ack.status === "ok") {
                    setMessages(prev => [...prev, ack.message]);
                } else {
                    console.error("sendMessage error:", ack.error);
                }
            }
        );
    };

    // Emit messageRead when messages for activeUser are loaded/viewed
    useEffect(() => {
        if (!socket || !activeUser) return;

        messages.forEach(msg => {
            if (msg.receiver === currentUserId && !msg.read) {
                socket.emit("messageRead", {
                    messageId: msg.id,
                    from: currentUserId,
                    to: activeUser.id
                });
            }
        });
    }, [messages, activeUser, socket, currentUserId]);

    // Listen for messageRead and messageReadAck
    useEffect(() => {
        if (!socket) return;
        // When the other user reads a message you sent
        const readHandler = ({ messageId }: {
            messageId: string;
            by: string;
            at: string;
        }) => {
            setMessages(prev =>
                prev.map(m => (m.id === messageId ? { ...m, read: true } : m))
            );
        };
        socket.on("messageRead", readHandler);

        // ack from server that your read request was processed
        const ackHandler = ({
            messageId,
            read
        }: {
            messageId,
            read
        }) => {
            // show toast later
            console.log("Read ack:", messageId, read);
        };
        socket.on("messageReadAck", ackHandler);

        return () => {
            socket.off("messageRead", readHandler);
            socket.off("messageReadAck", ackHandler);
        };
    }, [socket])

    const handleTyping = (text: string) => {
        if (!socket || !activeUser) return;
        socket.emit("typing", { to: activeUser.id, typing: true });
        window.clearTimeout(typingTimeout.current);
        typingTimeout.current = window.setTimeout(() => {
            socket.emit("typing", { to: activeUser.id, typing: false });
        }, 1000);
    };


    console.log('Current messages:', messages);
    return (
        <MainContainer
            responsive
            style={{
                height: '600px'
            }}
            className="flex flex-col"
        >
            <Sidebar
                position="left"
            >
                <Search placeholder="Search..." />
                <ConversationList>
                    {users.map(u => (
                        <Conversation
                            key={u.id}
                            name={u.username}
                            info={u.lastMessage ?? 'No messages yet'}
                            unreadCnt={u.unreadCount}
                            onClick={() => handleSelectUser(u)}
                        >
                            <Avatar
                                name={u.username}
                                src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                                status={u.isOnline ? 'available' : 'offline'}
                            />
                        </Conversation>
                    ))}
                </ConversationList>
            </Sidebar>
            {activeUser ? (
                <ChatContainer>
                    <ConversationHeader>
                        <ConversationHeader.Back />
                        <Avatar
                            name={activeUser?.username ?? ''}
                            src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                            status={activeUser?.isOnline ? 'available' : 'offline'}
                        />
                        <ConversationHeader.Content
                            info={activeUser ? (activeUser.isOnline ? 'Online' : 'Offline') : ''}
                            userName={activeUser?.username ?? ''}
                        />
                        <ConversationHeader.Actions>
                            <VoiceCallButton />
                            <VideoCallButton />
                            <EllipsisButton orientation="vertical" />
                        </ConversationHeader.Actions>
                    </ConversationHeader>

                    <MessageList typingIndicator={typingText ? <TypingIndicator content={typingText} /> : undefined}>
                        {messages.map(msg => (
                            <Message
                                key={msg.id}
                                model={{
                                    direction: msg.sender === currentUserId ? 'outgoing' : 'incoming',
                                    message: msg.content,
                                    position: 'single',
                                    sender: msg.sender === currentUserId ? 'You' : activeUser!.username,
                                    sentTime: new Date(msg.createdAt).toLocaleTimeString()
                                }}
                            >
                                {msg.sender !== currentUserId && (
                                    <Avatar
                                        name={activeUser!.username}
                                        // status={activeUser!.isOnline ? 'available' : 'offline'}
                                        src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
                                    />
                                )}
                            </Message>
                        ))}
                        {/* <MessageSeparator content="Saturday, 30 November 2019" /> */}
                    </MessageList>

                    <MessageInput
                        placeholder="Type message here"
                        onSend={handleSend}
                        onChange={handleTyping}
                    />
                </ChatContainer>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a conversation from the list
                </div>
            )}
        </MainContainer>
    );
};

export default MainContainerUI;
