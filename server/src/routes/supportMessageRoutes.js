import express from "express";
import SupportMessage from "../models/supportMessageModel.js";

const router = express.Router();

// ======================================================
// CREATE MESSAGE
// POST /api/v1/support/messages
// ======================================================

router.post(
  "/messages",
  async (req, res) => {
    try {
      const {
        user,
        name,
        email,
        conversationId,
        sender,
        message,
      } = req.body;

      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !name?.trim() ||
        !email?.trim() ||
        !conversationId?.trim() ||
        !sender ||
        !message?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All required fields are required.",
        });
      }

      // ==================================================
      // VALIDATE SENDER
      // ==================================================

      if (
        ![
          "user",
          "admin",
        ].includes(sender)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid sender type.",
        });
      }

      // ==================================================
      // CREATE MESSAGE
      // ==================================================

      const newMessage =
        await SupportMessage.create({
          user:
            user || null,

          name:
            name.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          conversationId:
            conversationId.trim(),

          sender,

          message:
            message.trim(),

          // Admin message automatically seen
          // User message initially unseen
          isSeen:
            sender === "admin",

          deletedByUser:
            false,

          deletedByAdmin:
            false,
        });

      // ==================================================
      // REAL-TIME SOCKET EMIT
      // ==================================================

      const io =
        req.app.get("io");

      if (io) {
        const room =
          `support:${conversationId.trim()}`;

        io.to(room).emit(
          "support-message",
          newMessage
        );

        console.log(
          `[Socket] Message emitted to ${room}`
        );
      }

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(201).json({
        success: true,

        message:
          "Message sent successfully.",

        data:
          newMessage,
      });
    } catch (error) {
      console.error(
        "Create Support Message Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to send message.",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// GET ALL SUPPORT MESSAGES
// GET /api/v1/support/messages
// ======================================================

router.get(
  "/messages",
  async (req, res) => {
    try {
      const messages =
        await SupportMessage.find({
          deletedByAdmin:
            false,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        count:
          messages.length,

        data:
          messages,
      });
    } catch (error) {
      console.error(
        "Get All Support Messages Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load support messages.",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// GET SINGLE CONVERSATION
// GET /api/v1/support/messages/:conversationId
// ======================================================

router.get(
  "/messages/:conversationId",
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      const messages =
        await SupportMessage.find({
          conversationId,

          deletedByUser:
            false,

          deletedByAdmin:
            false,
        }).sort({
          createdAt: 1,
        });

      return res.status(200).json({
        success: true,

        data:
          messages,
      });
    } catch (error) {
      console.error(
        "Get Support Conversation Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load conversation.",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// MARK AS SEEN
// PATCH /api/v1/support/messages/:id/seen
// ======================================================

router.patch(
  "/messages/:id/seen",
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const updatedMessage =
        await SupportMessage.findByIdAndUpdate(
          id,

          {
            isSeen: true,
          },

          {
            new: true,
          }
        );

      if (!updatedMessage) {
        return res.status(404).json({
          success: false,

          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Message marked as seen.",

        data:
          updatedMessage,
      });
    } catch (error) {
      console.error(
        "Mark Support Message Seen Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update message.",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// DELETE BY USER
// ======================================================

router.delete(
  "/messages/:id/user",
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const deletedMessage =
        await SupportMessage.findByIdAndUpdate(
          id,

          {
            deletedByUser:
              true,
          },

          {
            new: true,
          }
        );

      if (!deletedMessage) {
        return res.status(404).json({
          success: false,

          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Message deleted successfully.",

        data:
          deletedMessage,
      });
    } catch (error) {
      console.error(
        "User Delete Support Message Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete message.",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// DELETE BY ADMIN
// ======================================================

router.delete(
  "/messages/:id/admin",
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const deletedMessage =
        await SupportMessage.findByIdAndUpdate(
          id,

          {
            deletedByAdmin:
              true,
          },

          {
            new: true,
          }
        );

      if (!deletedMessage) {
        return res.status(404).json({
          success: false,

          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Message deleted successfully.",

        data:
          deletedMessage,
      });
    } catch (error) {
      console.error(
        "Admin Delete Support Message Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete message.",

        error:
          error.message,
      });
    }
  }
);

export default router;