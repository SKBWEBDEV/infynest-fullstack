import React, { useEffect, useMemo, useState } from "react";
import {
    HiChatAlt2,
    HiPaperAirplane,
    HiTrash,
    HiRefresh,
    HiSearch,
    HiUser,
    HiMail,
    HiX,
} from "react-icons/hi";

import API from "../../services/api";

export default function AdminSupport() {
    // =====================================================
    // STATES
    // =====================================================

    const [messages, setMessages] = useState([]);
    const [selectedConversation, setSelectedConversation] =
        useState(null);

    const [reply, setReply] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");

    const [error, setError] = useState("");

    // =====================================================
    // LOAD ALL SUPPORT MESSAGES
    // =====================================================

    const loadMessages = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get(
                "/support/messages"
            );

            if (response.data?.success) {
                setMessages(
                    response.data.data || []
                );
            }
        } catch (error) {
            console.error(
                "Load support messages error:",
                error
            );

            setError(
                "Failed to load support messages."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadMessages();
    }, []);

    // =====================================================
    // GROUP CONVERSATIONS
    // =====================================================

    const conversations = useMemo(() => {
        const grouped = {};

        messages.forEach((message) => {
            const id = message.conversationId;

            if (!grouped[id]) {
                grouped[id] = {
                    conversationId: id,
                    name: message.name,
                    email: message.email,
                    messages: [],
                };
            }

            grouped[id].messages.push(message);
        });

        return Object.values(grouped)
            .map((conversation) => {
                const sortedMessages = [
                    ...conversation.messages,
                ].sort(
                    (a, b) =>
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                );

                const lastMessage =
                    sortedMessages[
                    sortedMessages.length - 1
                    ];

                const unreadCount =
                    sortedMessages.filter(
                        (item) =>
                            item.sender === "user" &&
                            !item.isSeen
                    ).length;

                return {
                    ...conversation,
                    messages: sortedMessages,
                    lastMessage,
                    unreadCount,
                };
            })
            .sort(
                (a, b) =>
                    new Date(
                        b.lastMessage?.createdAt
                    ) -
                    new Date(
                        a.lastMessage?.createdAt
                    )
            );
    }, [messages]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredConversations =
        conversations.filter((conversation) => {
            const value =
                search.toLowerCase().trim();

            if (!value) return true;

            return (
                conversation.name
                    ?.toLowerCase()
                    .includes(value) ||
                conversation.email
                    ?.toLowerCase()
                    .includes(value) ||
                conversation.lastMessage?.message
                    ?.toLowerCase()
                    .includes(value)
            );
        });

    // =====================================================
    // SELECT CONVERSATION
    // =====================================================

    const handleSelectConversation = async (
        conversation
    ) => {
        setSelectedConversation(conversation);

        // Mark user messages as seen
        const unreadMessages =
            conversation.messages.filter(
                (item) =>
                    item.sender === "user" &&
                    !item.isSeen
            );

        try {
            await Promise.all(
                unreadMessages.map((item) =>
                    API.patch(
                        `/support/messages/${item._id}/seen`
                    )
                )
            );

            if (unreadMessages.length > 0) {
                setMessages((prev) =>
                    prev.map((item) => {
                        const found =
                            unreadMessages.some(
                                (unread) =>
                                    unread._id ===
                                    item._id
                            );

                        return found
                            ? {
                                ...item,
                                isSeen: true,
                            }
                            : item;
                    })
                );
            }
        } catch (error) {
            console.error(
                "Mark messages seen error:",
                error
            );
        }
    };

    // =====================================================
    // SEND ADMIN REPLY
    // =====================================================

    const handleSendReply = async () => {
        const cleanReply = reply.trim();

        if (!cleanReply) return;

        if (!selectedConversation) return;

        if (sending) return;

        try {
            setSending(true);
            setError("");

            const response = await API.post(
                "/support/reply",
                {
                    conversationId:
                        selectedConversation.conversationId,

                    message: cleanReply,
                }
            );

            if (response.data?.success) {
                const newMessage =
                    response.data.data;

                setMessages((prev) => [
                    ...prev,
                    newMessage,
                ]);

                setSelectedConversation(
                    (prev) => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            messages: [
                                ...prev.messages,
                                newMessage,
                            ],
                            lastMessage: newMessage,
                        };
                    }
                );

                setReply("");
            }
        } catch (error) {
            console.error(
                "Admin reply error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to send reply."
            );
        } finally {
            setSending(false);
        }
    };

    // =====================================================
    // ENTER TO SEND
    // =====================================================

    const handleReplyKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();

            handleSendReply();
        }
    };

    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    const handleDeleteMessage = async (
        messageId
    ) => {
        if (deleting) return;

        const confirmed = window.confirm(
            "Delete this message from admin side?"
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            await API.delete(
                `/support/messages/${messageId}/admin`
            );

            setMessages((prev) =>
                prev.filter(
                    (item) =>
                        item._id !== messageId
                )
            );

            setSelectedConversation(
                (prev) => {
                    if (!prev) return prev;

                    const updatedMessages =
                        prev.messages.filter(
                            (item) =>
                                item._id !==
                                messageId
                        );

                    return {
                        ...prev,
                        messages:
                            updatedMessages,

                        lastMessage:
                            updatedMessages[
                            updatedMessages.length -
                            1
                            ] || null,
                    };
                }
            );
        } catch (error) {
            console.error(
                "Delete support message error:",
                error
            );

            setError(
                "Failed to delete message."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(
            date
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="w-full h-[calc(100vh-80px)] min-h-[600px] bg-gray-50 p-3 sm:p-5 overflow-hidden">
            <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="h-16 px-4 sm:px-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <HiChatAlt2 className="text-indigo-600" />
                            Support Messages
                        </h1>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Manage customer conversations
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadMessages}
                        disabled={loading}
                        className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition"
                    >
                        <HiRefresh
                            size={17}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                    </button>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="flex flex-1 min-h-0">
                    {/* =================================================
                        CONVERSATION LIST
                    ================================================= */}

                    <div
                        className={`
                            w-full
                            md:w-[320px]
                            lg:w-[360px]
                            border-r
                            border-gray-200
                            flex
                            flex-col
                            bg-white

                            ${selectedConversation
                                ? "hidden md:flex"
                                : "flex"
                            }
                        `}
                    >
                        {/* SEARCH */}

                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <HiSearch
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={15}
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search conversations..."
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* LIST */}

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-5 space-y-3">
                                    {[1, 2, 3].map(
                                        (item) => (
                                            <div
                                                key={
                                                    item
                                                }
                                                className="animate-pulse flex gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-200" />

                                                <div className="flex-1">
                                                    <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                                                    <div className="h-2.5 w-full bg-gray-100 rounded" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : filteredConversations.length ===
                                0 ? (
                                <div className="p-8 text-center">
                                    <HiChatAlt2
                                        size={30}
                                        className="mx-auto text-gray-300 mb-2"
                                    />

                                    <p className="text-xs font-semibold text-gray-500">
                                        No conversations
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map(
                                    (
                                        conversation
                                    ) => (
                                        <button
                                            key={
                                                conversation.conversationId
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleSelectConversation(
                                                    conversation
                                                )
                                            }
                                            className={`
                                                w-full
                                                text-left
                                                px-4
                                                py-3
                                                border-b
                                                border-gray-100
                                                hover:bg-gray-50
                                                transition

                                                ${selectedConversation?.conversationId ===
                                                    conversation.conversationId
                                                    ? "bg-indigo-50"
                                                    : ""
                                                }
                                            `}
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                    <HiUser
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-bold text-gray-800 truncate">
                                                            {
                                                                conversation.name
                                                            }
                                                        </p>

                                                        {conversation.unreadCount >
                                                            0 && (
                                                                <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                                                                    {
                                                                        conversation.unreadCount
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>

                                                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                        {
                                                            conversation.email
                                                        }
                                                    </p>

                                                    <p className="text-[10px] text-gray-500 truncate mt-1">
                                                        {
                                                            conversation
                                                                .lastMessage
                                                                ?.message
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        CHAT PANEL
                    ================================================= */}

                    <div
                        className={`
                            flex-1
                            min-w-0
                            flex
                            flex-col
                            bg-gray-50

                            ${selectedConversation
                                ? "flex"
                                : "hidden md:flex"
                            }
                        `}
                    >
                        {!selectedConversation ? (
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                                        <HiChatAlt2
                                            size={
                                                28
                                            }
                                        />
                                    </div>

                                    <h2 className="text-sm font-bold text-gray-700">
                                        Select a conversation
                                    </h2>

                                    <p className="text-xs text-gray-400 mt-1">
                                        Choose a customer
                                        to view messages
                                        and reply.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* CHAT HEADER */}

                                <div className="h-16 px-4 sm:px-5 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedConversation(
                                                null
                                            )
                                        }
                                        className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <HiX size={17} />
                                    </button>

                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <HiUser
                                            size={17}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-xs font-bold text-gray-800 truncate">
                                            {
                                                selectedConversation.name
                                            }
                                        </h2>

                                        <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                                            <HiMail
                                                size={
                                                    11
                                                }
                                            />

                                            {
                                                selectedConversation.email
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* MESSAGES */}

                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                                    {selectedConversation.messages.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item._id
                                                }
                                                className={`flex ${item.sender ===
                                                        "admin"
                                                        ? "justify-end"
                                                        : "justify-start"
                                                    }`}
                                            >
                                                <div className="group max-w-[80%]">
                                                    <div
                                                        className={`
                                                            px-3.5
                                                            py-2.5
                                                            rounded-2xl
                                                            ${item.sender ===
                                                                "admin"
                                                                ? "bg-indigo-600 text-white rounded-br-md"
                                                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                                                            }
                                                        `}
                                                    >
                                                        {item.sender ===
                                                            "admin" && (
                                                                <p className="text-[9px] font-bold text-indigo-100 mb-1">
                                                                    INFYNEST
                                                                    Support
                                                                </p>
                                                            )}

                                                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                                            {
                                                                item.message
                                                            }
                                                        </p>

                                                        <div className="flex items-center justify-between gap-3 mt-1">
                                                            <span
                                                                className={`text-[9px] ${item.sender ===
                                                                        "admin"
                                                                        ? "text-indigo-100"
                                                                        : "text-gray-400"
                                                                    }`}
                                                            >
                                                                {formatTime(
                                                                    item.createdAt
                                                                )}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteMessage(
                                                                        item._id
                                                                    )
                                                                }
                                                                className={`opacity-0 group-hover:opacity-100 transition ${item.sender ===
                                                                        "admin"
                                                                        ? "text-indigo-100 hover:text-white"
                                                                        : "text-gray-400 hover:text-red-500"
                                                                    }`}
                                                                title="Delete"
                                                            >
                                                                <HiTrash
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* REPLY AREA */}

                                <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
                                    {error && (
                                        <p className="text-[10px] text-red-500 mb-2">
                                            {error}
                                        </p>
                                    )}

                                    <div className="relative">
                                        <textarea
                                            rows={2}
                                            value={reply}
                                            onChange={(e) =>
                                                setReply(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            onKeyDown={
                                                handleReplyKeyDown
                                            }
                                            disabled={
                                                sending
                                            }
                                            placeholder="Write your reply..."
                                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 pr-12 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                handleSendReply
                                            }
                                            disabled={
                                                sending ||
                                                !reply.trim()
                                            }
                                            className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white flex items-center justify-center transition"
                                        >
                                            {sending ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <HiPaperAirplane
                                                    size={
                                                        15
                                                    }
                                                />
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-[9px] text-gray-400 mt-2">
                                        Enter = send · Shift +
                                        Enter = new line
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}