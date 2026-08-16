import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    HiChatAlt2,
    HiX,
    HiPaperAirplane,
    HiCheck,
    HiCheckCircle,
} from "react-icons/hi";

import API from "../services/api";
import socket from "../services/socket";

export default function FloatingSupport() {
    // ======================================================
    // STATES
    // ======================================================

    const [open, setOpen] =
        useState(false);

    const [position, setPosition] =
        useState(null);

    const [isDragging, setIsDragging] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [loadingMessages, setLoadingMessages] =
        useState(false);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [messages, setMessages] =
        useState([]);

    const [hasNewReply, setHasNewReply] =
        useState(false);

    const [error, setError] =
        useState("");

    // ======================================================
    // SINGLE CONVERSATION ID
    // ======================================================

    const [conversationId] =
        useState(() => {
            try {
                const saved =
                    localStorage.getItem(
                        "infynest_support_conversation_id"
                    );

                if (saved) {
                    return saved;
                }

                const newId =
                    crypto?.randomUUID
                        ? crypto.randomUUID()
                        : `support_${Date.now()}_${Math.random()
                            .toString(36)
                            .slice(2, 10)}`;

                localStorage.setItem(
                    "infynest_support_conversation_id",
                    newId
                );

                return newId;
            } catch (error) {
                console.error(
                    "Conversation ID error:",
                    error
                );

                const fallbackId =
                    `support_${Date.now()}_${Math.random()
                        .toString(36)
                        .slice(2, 10)}`;

                localStorage.setItem(
                    "infynest_support_conversation_id",
                    fallbackId
                );

                return fallbackId;
            }
        });

    // ======================================================
    // REFS
    // ======================================================

    const buttonRef =
        useRef(null);

    const messagesEndRef =
        useRef(null);

    const textareaRef =
        useRef(null);

    const dragData =
        useRef({
            offsetX: 0,
            offsetY: 0,
            moved: false,
            startX: 0,
            startY: 0,
        });

    // ======================================================
    // GET CURRENT USER
    // ======================================================

    const getCurrentUser =
        () => {
            try {
                const storedUser =
                    localStorage.getItem(
                        "userInfo"
                    );

                if (!storedUser) {
                    return null;
                }

                return JSON.parse(
                    storedUser
                );
            } catch (error) {
                console.error(
                    "User parse error:",
                    error
                );

                return null;
            }
        };

    // ======================================================
    // LOAD USER INFORMATION
    // ======================================================

    useEffect(() => {
        const user =
            getCurrentUser();

        if (!user) {
            return;
        }

        setName(
            user?.name ||
            user?.fullName ||
            user?.username ||
            ""
        );

        setEmail(
            user?.email || ""
        );
    }, []);

    // ======================================================
    // GET USER ID
    // ======================================================

    const getCurrentUserId =
        () => {
            const user =
                getCurrentUser();

            return (
                user?.id ||
                user?._id ||
                null
            );
        };

    // ======================================================
    // LOAD CONVERSATION
    // ======================================================

    const fetchMessages =
        async () => {
            if (!conversationId) {
                return;
            }

            try {
                setLoadingMessages(
                    true
                );

                const response =
                    await API.get(
                        `/support/messages/${conversationId}`
                    );

                const serverMessages =
                    response.data?.data ||
                    [];

                setMessages(
                    serverMessages
                );

                const latest =
                    serverMessages[
                    serverMessages.length -
                    1
                    ];

                if (
                    latest?.sender ===
                    "admin" &&
                    !latest?.isSeen
                ) {
                    setHasNewReply(
                        true
                    );
                }
            } catch (error) {
                console.error(
                    "Fetch support messages error:",
                    error
                );
            } finally {
                setLoadingMessages(
                    false
                );
            }
        };

    // ======================================================
    // SOCKET JOIN + REAL-TIME MESSAGE
    // ======================================================

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        // JOIN ROOM
        socket.emit(
            "join-support",
            conversationId
        );

        // ==================================================
        // INCOMING MESSAGE
        // ==================================================

        const handleIncomingMessage =
            (newMessage) => {
                if (
                    newMessage?.conversationId !==
                    conversationId
                ) {
                    return;
                }

                setMessages(
                    (previous) => {
                        const exists =
                            previous.some(
                                (item) =>
                                    item._id ===
                                    newMessage._id
                            );

                        if (exists) {
                            return previous;
                        }

                        return [
                            ...previous,
                            newMessage,
                        ];
                    }
                );

                // ADMIN REPLY
                if (
                    newMessage.sender ===
                    "admin"
                ) {
                    setHasNewReply(
                        true
                    );
                }
            };

        socket.on(
            "support-message",
            handleIncomingMessage
        );

        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {
            socket.emit(
                "leave-support",
                conversationId
            );

            socket.off(
                "support-message",
                handleIncomingMessage
            );
        };
    }, [conversationId]);

    // ======================================================
    // INITIAL FETCH
    // ======================================================

    useEffect(() => {
        fetchMessages();
    }, [conversationId]);

    // ======================================================
    // FALLBACK REFRESH
    // ======================================================

    useEffect(() => {
        const interval =
            setInterval(() => {
                fetchMessages();
            }, 30000);

        return () => {
            clearInterval(
                interval
            );
        };
    }, [conversationId]);

    // ======================================================
    // AUTO SCROLL
    // ======================================================

    useEffect(() => {
        if (!open) {
            return;
        }

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView(
                {
                    behavior:
                        "smooth",
                }
            );
        }, 50);
    }, [messages, open]);

    // ======================================================
    // POINTER DOWN
    // ======================================================

    const handlePointerDown =
        (e) => {
            if (
                !buttonRef.current
            ) {
                return;
            }

            const rect =
                buttonRef.current.getBoundingClientRect();

            dragData.current = {
                offsetX:
                    e.clientX -
                    rect.left,

                offsetY:
                    e.clientY -
                    rect.top,

                moved: false,

                startX:
                    e.clientX,

                startY:
                    e.clientY,
            };

            setIsDragging(
                true
            );

            buttonRef.current.setPointerCapture?.(
                e.pointerId
            );
        };

    // ======================================================
    // POINTER MOVE
    // ======================================================

    const handlePointerMove =
        (e) => {
            if (
                !isDragging ||
                !buttonRef.current
            ) {
                return;
            }

            const width =
                buttonRef.current
                    .offsetWidth;

            const height =
                buttonRef.current
                    .offsetHeight;

            const margin = 8;

            let left =
                e.clientX -
                dragData.current
                    .offsetX;

            let top =
                e.clientY -
                dragData.current
                    .offsetY;

            const maxLeft =
                window.innerWidth -
                width -
                margin;

            const maxTop =
                window.innerHeight -
                height -
                margin;

            left = Math.max(
                margin,
                Math.min(
                    left,
                    maxLeft
                )
            );

            top = Math.max(
                margin,
                Math.min(
                    top,
                    maxTop
                )
            );

            const distance =
                Math.sqrt(
                    Math.pow(
                        e.clientX -
                        dragData.current
                            .startX,
                        2
                    ) +
                    Math.pow(
                        e.clientY -
                        dragData.current
                            .startY,
                        2
                    )
                );

            if (
                distance > 5
            ) {
                dragData.current.moved =
                    true;
            }

            setPosition({
                left,
                top,
            });
        };

    // ======================================================
    // POINTER UP
    // ======================================================

    const handlePointerUp =
        (e) => {
            if (!isDragging) {
                return;
            }

            setIsDragging(
                false
            );

            buttonRef.current?.releasePointerCapture?.(
                e.pointerId
            );
        };

    // ======================================================
    // BUTTON CLICK
    // ======================================================

    const handleClick =
        () => {
            if (
                dragData.current
                    .moved
            ) {
                dragData.current.moved =
                    false;

                return;
            }

            setOpen(
                (previous) =>
                    !previous
            );

            setHasNewReply(
                false
            );

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 150);
        };

    // ======================================================
    // SEND MESSAGE
    // ======================================================

    const handleSendMessage =
        async () => {
            setError("");

            const cleanName =
                name.trim();

            const cleanEmail =
                email.trim();

            const cleanMessage =
                message.trim();

            // ==================================================
            // VALIDATION
            // ==================================================

            if (!cleanName) {
                setError(
                    "Please enter your name."
                );

                return;
            }

            if (!cleanEmail) {
                setError(
                    "Please enter your email."
                );

                return;
            }

            if (
                !cleanEmail.includes(
                    "@"
                )
            ) {
                setError(
                    "Please enter a valid email."
                );

                return;
            }

            if (!cleanMessage) {
                setError(
                    "Please write your message."
                );

                return;
            }

            if (!conversationId) {
                setError(
                    "Conversation is not ready."
                );

                return;
            }

            if (sending) {
                return;
            }

            // ==================================================
            // START SENDING
            // ==================================================

            setSending(true);

            try {
                const currentUserId =
                    getCurrentUserId();

                const payload = {
                    user:
                        currentUserId ||
                        null,

                    name:
                        cleanName,

                    email:
                        cleanEmail,

                    conversationId:
                        conversationId,

                    sender:
                        "user",

                    message:
                        cleanMessage,
                };

                console.log(
                    "[Support] Sending:",
                    payload
                );

                const response =
                    await API.post(
                        "/support/messages",
                        payload
                    );

                const newMessage =
                    response.data?.data;

                // ==================================================
                // ADD LOCALLY
                // ==================================================

                if (newMessage) {
                    setMessages(
                        (previous) => {
                            const exists =
                                previous.some(
                                    (item) =>
                                        item._id ===
                                        newMessage._id
                                );

                            if (
                                exists
                            ) {
                                return previous;
                            }

                            return [
                                ...previous,
                                newMessage,
                            ];
                        }
                    );
                }

                setMessage(
                    ""
                );

                setError("");

                setTimeout(() => {
                    textareaRef.current?.focus();
                }, 100);
            } catch (error) {
                console.error(
                    "[Support] Send error:",
                    error
                );

                console.error(
                    "[Support] Response:",
                    error?.response?.data
                );

                setError(
                    error?.response?.data
                        ?.message ||
                    "Message could not be sent. Please try again."
                );
            } finally {
                setSending(
                    false
                );
            }
        };

    // ======================================================
    // ENTER TO SEND
    // ======================================================

    const handleMessageKeyDown =
        (e) => {
            if (
                e.key ===
                "Enter" &&
                !e.shiftKey
            ) {
                e.preventDefault();

                handleSendMessage();
            }
        };

    // ======================================================
    // BUTTON STYLE
    // ======================================================

    const buttonStyle =
        position
            ? {
                left: `${position.left}px`,
                top: `${position.top}px`,
                right: "auto",
                bottom: "auto",
            }
            : {};

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <>
            {/* ==================================================
                FLOATING BUTTON
            ================================================== */}

            <button
                ref={buttonRef}
                type="button"
                onPointerDown={
                    handlePointerDown
                }
                onPointerMove={
                    handlePointerMove
                }
                onPointerUp={
                    handlePointerUp
                }
                onPointerCancel={
                    handlePointerUp
                }
                onClick={
                    handleClick
                }
                style={
                    buttonStyle
                }
                aria-label="Contact Support"
                className={`
                    fixed
                    ${position
                        ? ""
                        : "bottom-5 right-5 sm:bottom-6 sm:right-6"
                    }
                    z-[9998]

                    min-w-[120px]
                    h-12
                    px-4

                    rounded-full

                    bg-indigo-600
                    hover:bg-indigo-700

                    text-white

                    shadow-xl

                    flex
                    items-center
                    justify-center

                    transition-all
                    duration-300

                    ${isDragging
                        ? "cursor-grabbing scale-105"
                        : "cursor-grab"
                    }

                    active:scale-95

                    touch-none
                    select-none
                `}
            >
                {open ? (
                    <HiX
                        size={23}
                    />
                ) : (
                    <>
                        <HiChatAlt2
                            size={20}
                        />

                        <span className="text-xs font-bold ml-1.5">
                            Support
                        </span>
                    </>
                )}

                {!open &&
                    hasNewReply && (
                        <span
                            className="
                                absolute
                                top-1
                                right-1
                                w-3
                                h-3
                                bg-red-500
                                border-2
                                border-white
                                rounded-full
                                animate-pulse
                            "
                        />
                    )}
            </button>

            {/* ==================================================
                POPUP
            ================================================== */}

            {open && (
                <div
                    className="
                        fixed
                        bottom-20
                        right-3
                        sm:bottom-24
                        sm:right-6
                        z-[9997]

                        w-[calc(100%-1.5rem)]
                        sm:w-[calc(100%-3rem)]

                        max-w-sm

                        bg-white
                        rounded-2xl
                        shadow-2xl

                        border
                        border-gray-200

                        overflow-hidden

                        animate-support-popup
                    "
                >
                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div
                        className="
                            bg-indigo-600
                            text-white

                            px-4
                            py-4

                            flex
                            items-center
                            justify-between
                        "
                    >
                        <div>
                            <h3 className="text-sm font-bold">
                                Contact INFYNEST
                            </h3>

                            <p className="text-[11px] text-indigo-100 mt-1">
                                We're here to help you
                            </p>
                        </div>

                        <div
                            className="
                                w-9
                                h-9
                                rounded-full
                                bg-white/15
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <HiChatAlt2
                                size={19}
                            />
                        </div>
                    </div>

                    {/* ==================================================
                        MESSAGES
                    ================================================== */}

                    <div
                        className="
                            max-h-[240px]
                            min-h-[100px]

                            overflow-y-auto

                            px-4
                            pt-4
                            pb-2

                            space-y-3

                            bg-gray-50

                            scrollbar-thin
                        "
                    >
                        {loadingMessages &&
                            messages.length ===
                            0 && (
                                <div className="flex justify-center py-4">
                                    <div
                                        className="
                                            w-5
                                            h-5
                                            border-2
                                            border-indigo-600
                                            border-t-transparent
                                            rounded-full
                                            animate-spin
                                        "
                                    />
                                </div>
                            )}

                        {!loadingMessages &&
                            messages.length ===
                            0 && (
                                <div className="text-center py-5">
                                    <div
                                        className="
                                            w-11
                                            h-11
                                            mx-auto
                                            rounded-full
                                            bg-indigo-100
                                            text-indigo-600
                                            flex
                                            items-center
                                            justify-center
                                            mb-3
                                        "
                                    >
                                        <HiChatAlt2
                                            size={21}
                                        />
                                    </div>

                                    <p className="text-xs font-semibold text-gray-700">
                                        Start a conversation
                                    </p>

                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Send us your question and our team will help you.
                                    </p>
                                </div>
                            )}

                        {messages.map(
                            (
                                item,
                                index
                            ) => {
                                const messageId =
                                    item._id ||
                                    `${item.createdAt}-${index}`;

                                const isUser =
                                    item.sender ===
                                    "user";

                                return (
                                    <div
                                        key={
                                            messageId
                                        }
                                        className={`flex ${isUser
                                                ? "justify-end"
                                                : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`
                                                max-w-[82%]
                                                px-3.5
                                                py-2.5
                                                rounded-2xl

                                                ${isUser
                                                    ? "bg-indigo-600 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                                                }
                                            `}
                                        >
                                            {!isUser && (
                                                <p className="text-[9px] font-bold text-indigo-600 mb-1">
                                                    INFYNEST Support
                                                </p>
                                            )}

                                            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                                {
                                                    item.message
                                                }
                                            </p>

                                            <div
                                                className={`
                                                    flex
                                                    items-center
                                                    justify-end
                                                    gap-1
                                                    mt-1

                                                    ${isUser
                                                        ? "text-indigo-100"
                                                        : "text-gray-400"
                                                    }
                                                `}
                                            >
                                                <span className="text-[9px]">
                                                    {item.createdAt
                                                        ? new Date(
                                                            item.createdAt
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )
                                                        : ""}
                                                </span>

                                                {isUser && (
                                                    <HiCheck
                                                        size={
                                                            11
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}

                        <div
                            ref={
                                messagesEndRef
                            }
                        />
                    </div>

                    {/* ==================================================
                        FORM
                    ================================================== */}

                    <div className="p-4 bg-white">
                        {/* NAME */}

                        <div className="mb-2.5">
                            <input
                                type="text"
                                value={
                                    name
                                }
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Your name"
                                disabled={
                                    sending
                                }
                                className="
                                    w-full
                                    px-3.5
                                    py-2.5
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    text-xs
                                    text-gray-800
                                    placeholder-gray-400
                                    focus:outline-none
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                    disabled:opacity-60
                                "
                            />
                        </div>

                        {/* EMAIL */}

                        <div className="mb-2.5">
                            <input
                                type="email"
                                value={
                                    email
                                }
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Email address"
                                disabled={
                                    sending
                                }
                                className="
                                    w-full
                                    px-3.5
                                    py-2.5
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    text-xs
                                    text-gray-800
                                    placeholder-gray-400
                                    focus:outline-none
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                    disabled:opacity-60
                                "
                            />
                        </div>

                        {/* MESSAGE */}

                        <div className="relative">
                            <textarea
                                ref={
                                    textareaRef
                                }
                                rows={
                                    3
                                }
                                value={
                                    message
                                }
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }
                                onKeyDown={
                                    handleMessageKeyDown
                                }
                                placeholder="Write a message..."
                                disabled={
                                    sending
                                }
                                className="
                                    w-full
                                    px-3.5
                                    py-3
                                    pr-12
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    text-xs
                                    text-gray-800
                                    placeholder-gray-400
                                    focus:outline-none
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                    resize-none
                                    disabled:opacity-60
                                "
                            />

                            <button
                                type="button"
                                onClick={
                                    handleSendMessage
                                }
                                disabled={
                                    sending ||
                                    !message.trim()
                                }
                                className="
                                    absolute
                                    right-2
                                    bottom-2
                                    w-9
                                    h-9
                                    rounded-full

                                    bg-indigo-600
                                    hover:bg-indigo-700

                                    disabled:bg-gray-300
                                    disabled:cursor-not-allowed

                                    text-white

                                    flex
                                    items-center
                                    justify-center

                                    transition
                                "
                            >
                                {sending ? (
                                    <span
                                        className="
                                            w-4
                                            h-4
                                            border-2
                                            border-white
                                            border-t-transparent
                                            rounded-full
                                            animate-spin
                                        "
                                    />
                                ) : (
                                    <HiPaperAirplane
                                        size={16}
                                    />
                                )}
                            </button>
                        </div>

                        {/* ERROR */}

                        {error && (
                            <p className="text-[10px] text-red-500 mt-2">
                                {
                                    error
                                }
                            </p>
                        )}

                        {/* INFO */}

                        <div className="flex items-center justify-center gap-1 mt-3">
                            <HiCheckCircle
                                size={12}
                                className="text-green-500"
                            />

                            <span className="text-[9px] text-gray-400">
                                We usually reply as soon as possible
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================
                ANIMATION
            ================================================== */}

            <style>{`
                @keyframes supportPopup {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.96);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-support-popup {
                    animation: supportPopup 0.2s ease-out;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }

                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 999px;
                }
            `}</style>
        </>
    );
}