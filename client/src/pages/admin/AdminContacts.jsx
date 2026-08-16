import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

import {
  HiSearch,
  HiChatAlt2,
  HiMail,
  HiUser,
  HiClock,
  HiTrash,
  HiPaperAirplane,
  HiRefresh,
  HiChevronLeft,
} from "react-icons/hi";

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [reply, setReply] = useState("");

  // ======================================================
  // FETCH ALL SUPPORT MESSAGES
  // GET /api/v1/support/messages
  // ======================================================

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const response = await API.get("/support/messages");

      setMessages(response.data?.data || []);
    } catch (error) {
      console.error("Fetch support messages error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load support messages",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchMessages();
  }, []);

  // ======================================================
  // GROUP MESSAGES BY CONVERSATION
  // ======================================================

  const conversations = useMemo(() => {
    const grouped = {};

    messages.forEach((message) => {
      const conversationId = message.conversationId;

      if (!conversationId) return;

      if (!grouped[conversationId]) {
        grouped[conversationId] = {
          conversationId,
          name: message.name,
          email: message.email,
          messages: [],
        };
      }

      grouped[conversationId].messages.push(message);
    });

    return Object.values(grouped)
      .map((conversation) => {
        const sortedMessages = [...conversation.messages].sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt),
        );

        const lastMessage =
          sortedMessages[sortedMessages.length - 1];

        const unreadCount = sortedMessages.filter(
          (message) =>
            message.sender === "user" &&
            !message.isSeen,
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
          new Date(b.lastMessage?.createdAt || 0) -
          new Date(a.lastMessage?.createdAt || 0),
      );
  }, [messages]);

  // ======================================================
  // SEARCH CONVERSATIONS
  // ======================================================

  const filteredConversations = conversations.filter(
    (conversation) => {
      const search = searchTerm.toLowerCase();

      return (
        conversation.name
          ?.toLowerCase()
          .includes(search) ||
        conversation.email
          ?.toLowerCase()
          .includes(search) ||
        conversation.lastMessage?.message
          ?.toLowerCase()
          .includes(search)
      );
    },
  );

  // ======================================================
  // OPEN CONVERSATION
  // ======================================================

  const openConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setConversationLoading(true);

      const response = await API.get(
        `/support/messages/${conversation.conversationId}`,
      );

      const conversationMessages =
        response.data?.data || [];

      setSelectedConversation({
        ...conversation,
        messages: conversationMessages,
      });

      // Mark unread user messages as seen
      const unreadMessages = conversationMessages.filter(
        (message) =>
          message.sender === "user" &&
          !message.isSeen,
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map((message) =>
            API.patch(
              `/support/messages/${message._id}/seen`,
            ),
          ),
        );

        setMessages((previous) =>
          previous.map((message) =>
            unreadMessages.some(
              (unread) => unread._id === message._id,
            )
              ? {
                  ...message,
                  isSeen: true,
                }
              : message,
          ),
        );

        setSelectedConversation((previous) => ({
          ...previous,
          messages: previous.messages.map((message) =>
            unreadMessages.some(
              (unread) => unread._id === message._id,
            )
              ? {
                  ...message,
                  isSeen: true,
                }
              : message,
          ),
        }));
      }
    } catch (error) {
      console.error(
        "Open conversation error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load conversation",
      );
    } finally {
      setConversationLoading(false);
    }
  };

  // ======================================================
  // SEND ADMIN REPLY
  // POST /api/v1/support/messages
  // ======================================================

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      return;
    }

    if (!selectedConversation) {
      return;
    }

    try {
      setSending(true);

      const payload = {
        user:
          selectedConversation.messages?.find(
            (message) => message.user,
          )?.user || null,

        name: selectedConversation.name,

        email: selectedConversation.email,

        conversationId:
          selectedConversation.conversationId,

        sender: "admin",

        message: reply.trim(),
      };

      const response = await API.post(
        "/support/messages",
        payload,
      );

      const newMessage = response.data?.data;

      if (newMessage) {
        setSelectedConversation((previous) => ({
          ...previous,
          messages: [
            ...(previous?.messages || []),
            newMessage,
          ],
        }));

        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);
      }

      setReply("");

      toast.success("Reply sent successfully");
    } catch (error) {
      console.error(
        "Send admin reply error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to send reply",
      );
    } finally {
      setSending(false);
    }
  };

  // ======================================================
  // DELETE MESSAGE BY ADMIN
  // DELETE /api/v1/support/messages/:id/admin
  // ======================================================

  const handleDeleteMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/support/messages/${messageId}/admin`,
      );

      setMessages((previous) =>
        previous.filter(
          (message) => message._id !== messageId,
        ),
      );

      setSelectedConversation((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          messages: previous.messages.filter(
            (message) => message._id !== messageId,
          ),
        };
      });

      toast.success("Message deleted successfully");
    } catch (error) {
      console.error(
        "Delete support message error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete message",
      );
    }
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <HiChatAlt2 size={23} />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-black">
                Support Messages
              </h1>

              <p className="text-xs text-gray-500 mt-1">
                Manage customer conversations and replies
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181b22] border border-gray-800 text-gray-300 hover:bg-gray-800 transition text-xs font-semibold"
        >
          <HiRefresh size={15} />
          Refresh
        </button>
      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="relative mb-5 max-w-md">
        <HiSearch
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search customer or message..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="w-full pl-11 pr-4 py-3 bg-[#161920] border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-5">

        {/* ==================================================
            CONVERSATION LIST
        ================================================== */}

        <div className="bg-[#161920] border border-gray-800/60 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-800/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                Conversations
              </h2>

              <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                {filteredConversations.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />

              <p className="text-[11px] text-gray-500 mt-3">
                Loading conversations...
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-16 text-center px-5">
              <HiChatAlt2
                size={35}
                className="mx-auto text-gray-700"
              />

              <p className="text-xs text-gray-500 mt-3">
                No conversations found.
              </p>
            </div>
          ) : (
            <div className="max-h-[700px] overflow-y-auto">

              {filteredConversations.map(
                (conversation) => {
                  const isActive =
                    selectedConversation
                      ?.conversationId ===
                    conversation.conversationId;

                  return (
                    <button
                      key={conversation.conversationId}
                      type="button"
                      onClick={() =>
                        openConversation(conversation)
                      }
                      className={`w-full text-left p-4 border-b border-gray-800/50 transition ${
                        isActive
                          ? "bg-purple-600/10 border-l-2 border-l-purple-500"
                          : "hover:bg-gray-800/30"
                      }`}
                    >
                      <div className="flex gap-3">

                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                          {conversation.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex justify-between gap-2">

                            <p className="text-xs font-bold text-white truncate">
                              {conversation.name ||
                                "Unknown User"}
                            </p>

                            {conversation.unreadCount >
                              0 && (
                              <span className="min-w-5 h-5 px-1.5 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {conversation.email}
                          </p>

                          <p
                            className={`text-[10px] truncate mt-2 ${
                              conversation.unreadCount > 0
                                ? "text-gray-200 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {conversation.lastMessage
                              ?.sender === "admin" && (
                              <span className="text-purple-400">
                                You:{" "}
                              </span>
                            )}

                            {conversation.lastMessage
                              ?.message ||
                              "No message"}
                          </p>

                          <p className="text-[9px] text-gray-700 mt-1">
                            {formatDate(
                              conversation.lastMessage
                                ?.createdAt,
                            )}
                          </p>

                        </div>
                      </div>
                    </button>
                  );
                },
              )}

            </div>
          )}
        </div>

        {/* ==================================================
            CHAT WINDOW
        ================================================== */}

        <div className="bg-[#161920] border border-gray-800/60 rounded-2xl overflow-hidden min-h-[700px] flex flex-col">

          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">

              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <HiChatAlt2 size={30} />
              </div>

              <h2 className="text-sm font-bold mt-4">
                Select a conversation
              </h2>

              <p className="text-[11px] text-gray-600 mt-2 max-w-sm">
                Select a customer conversation from the
                left side to view messages and reply.
              </p>

            </div>
          ) : (
            <>
              {/* ==================================================
                  CHAT HEADER
              ================================================== */}

              <div className="px-5 py-4 border-b border-gray-800/60 flex items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedConversation(null)
                  }
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
                >
                  <HiChevronLeft size={18} />
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm">
                  {selectedConversation.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold truncate">
                    {selectedConversation.name ||
                      "Unknown User"}
                  </h2>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                    <HiMail size={11} />
                    {selectedConversation.email}
                  </div>
                </div>

              </div>

              {/* ==================================================
                  MESSAGES
              ================================================== */}

              <div className="flex-1 p-5 overflow-y-auto">

                {conversationLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  </div>
                ) : selectedConversation.messages
                    ?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-600">
                    No messages in this conversation.
                  </div>
                ) : (
                  <div className="space-y-4">

                    {selectedConversation.messages.map(
                      (message) => {
                        const isAdmin =
                          message.sender === "admin";

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isAdmin
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] ${
                                isAdmin
                                  ? "items-end"
                                  : "items-start"
                              } flex flex-col`}
                            >

                              <div
                                className={`px-4 py-3 rounded-2xl ${
                                  isAdmin
                                    ? "bg-purple-600 text-white rounded-br-md"
                                    : "bg-[#20242d] text-gray-200 rounded-bl-md"
                                }`}
                              >
                                <p className="text-xs leading-5 whitespace-pre-wrap break-words">
                                  {message.message}
                                </p>
                              </div>

                              <div
                                className={`flex items-center gap-2 mt-1 ${
                                  isAdmin
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <HiClock
                                  size={10}
                                  className="text-gray-700"
                                />

                                <span className="text-[9px] text-gray-700">
                                  {formatDate(
                                    message.createdAt,
                                  )}
                                </span>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteMessage(
                                        message._id,
                                      )
                                    }
                                    className="text-gray-700 hover:text-red-400 transition"
                                    title="Delete message"
                                  >
                                    <HiTrash size={11} />
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      },
                    )}

                  </div>
                )}

              </div>

              {/* ==================================================
                  REPLY BOX
              ================================================== */}

              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-gray-800/60"
              >
                <div className="flex gap-2">

                  <input
                    type="text"
                    value={reply}
                    onChange={(e) =>
                      setReply(e.target.value)
                    }
                    placeholder="Write a reply..."
                    className="flex-1 px-4 py-3 bg-[#20242d] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      sending || !reply.trim()
                    }
                    className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
                    title="Send Reply"
                  >
                    {sending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <HiPaperAirplane
                        size={17}
                      />
                    )}
                  </button>

                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
