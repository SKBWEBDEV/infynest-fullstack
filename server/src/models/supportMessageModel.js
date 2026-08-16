import mongoose from "mongoose";

// ======================================================
// SUPPORT MESSAGE SCHEMA
// ======================================================

const supportMessageSchema = new mongoose.Schema(
    {
        // ====================================================
        // USER
        // ====================================================

        // Logged-in user হলে User ID থাকবে।
        // Guest হলে null থাকবে।
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ====================================================
        // CUSTOMER INFORMATION
        // ====================================================

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 150,
        },

        // ====================================================
        // CONVERSATION
        // ====================================================

        conversationId: {
            type: String,
            required: true,
            index: true,
        },

        // ====================================================
        // MESSAGE SENDER
        // ====================================================

        sender: {
            type: String,
            enum: ["user", "admin"],
            required: true,
        },

        // ====================================================
        // MESSAGE
        // ====================================================

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        // ====================================================
        // SEEN STATUS
        // ====================================================

        // User message হলে admin দেখেছে কিনা।
        // Admin message হলে user দেখেছে কিনা।
        isSeen: {
            type: Boolean,
            default: false,
        },

        // ====================================================
        // SOFT DELETE
        // ====================================================

        // User নিজের side থেকে message delete করলে true
        deletedByUser: {
            type: Boolean,
            default: false,
        },

        // Admin নিজের side থেকে message delete করলে true
        deletedByAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// ======================================================
// MODEL
// ======================================================

const SupportMessage = mongoose.model(
    "SupportMessage",
    supportMessageSchema
);

export default SupportMessage;