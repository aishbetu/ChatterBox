const mongoose = require('mongoose');
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = {
    getUsers: async (req, res) => {
        try {
            const loggedInUserId = req.user.sub;

            // Use aggregation pipeline instead of simple find
            const users = await User.aggregate([
                // Exclude the current user
                {
                    $match: {
                        _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) }
                    }
                },
                // Lookup to find messages between current user and each other user
                {
                    $lookup: {
                        from: "messages",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ["$sender", "$$userId"] },
                                                    { $eq: ["$receiver", new mongoose.Types.ObjectId(loggedInUserId)] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $eq: ["$receiver", "$$userId"] },
                                                    { $eq: ["$sender", new mongoose.Types.ObjectId(loggedInUserId)] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            { $sort: { createdAt: -1 } }
                        ],
                        as: "messages"
                    }
                },
                // Add a field with the last message
                {
                    $addFields: {
                        lastMessage: { $arrayElemAt: ["$messages", 0] },
                    }
                },
                // Count unread messages sent by other users to current user
                {
                    $addFields: {
                        unreadCount: {
                            $size: {
                                $filter: {
                                    input: "$messages",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$this.sender", "$_id"] },
                                            { $eq: ["$$this.receiver", new mongoose.Types.ObjectId(loggedInUserId)] },
                                            { $eq: ["$$this.read", false] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                // Project only the fields we need
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        email: 1,
                        lastMessage: 1,
                        unreadCount: 1
                    }
                },
                // Sort by the timestamp of the last message (most recent first)
                {
                    $sort: {
                        "lastMessage.createdAt": -1,
                        "username": 1 // Secondary sort by username if no messages exist
                    }
                }
            ]);

            if (!users || users.length === 0) {
                return res.status(404).json({
                    message: 'No users found',
                    users: []
                });
            }

            res.status(200).json({
                message: 'Users fetched successfully',
                users: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            const err = new Error('Error fetching users');
            err.status = 400;
            throw err;
        }
    },

//     getMessages: async (req, res) => {
//     try {
//         const currentUserId = req.user.sub;
//         const selectedUserId = req.params.userId;
        
//         // Pagination parameters
//         const page = parseInt(req.query.page) || 1; // Default to first page
//         const limit = parseInt(req.query.limit) || 20; // Default 20 messages per page
//         const skip = (page - 1) * limit;
        
//         // Find messages between the two users
//         const fetchMessages = await Message.find({
//             $or: [
//                 { sender: currentUserId, receiver: selectedUserId },
//                 { sender: selectedUserId, receiver: currentUserId }
//             ]
//         })
//         .sort({ createdAt: -1 }) // Sort from newest to oldest
//         .skip(skip)
//         .limit(limit);
        
//         // Get total count for pagination metadata
//         const totalCount = await Message.countDocuments({
//             $or: [
//                 { sender: currentUserId, receiver: selectedUserId },
//                 { sender: selectedUserId, receiver: currentUserId }
//             ]
//         });
        
//         // Calculate pagination metadata
//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;
        
//         // If no messages found, return empty array with pagination info
//         if (fetchMessages.length === 0) {
//             return res.status(200).json({
//                 message: 'No messages found',
//                 messages: [],
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalMessages: totalCount,
//                     hasNextPage,
//                     hasPrevPage
//                 }
//             });
//         }
        
//         // Update unread messages to read if they were sent to current user
//         await Message.updateMany(
//             { 
//                 sender: selectedUserId, 
//                 receiver: currentUserId,
//                 read: false 
//             },
//             { read: true }
//         );
        
//         // Map messages to desired format and send response
//         res.status(200).json({
//             message: 'Messages fetched successfully',
//             messages: fetchMessages.map(message => ({
//                 id: message._id,
//                 sender: message.sender,
//                 receiver: message.receiver,
//                 content: message.content,
//                 read: message.read,
//                 createdAt: message.createdAt,
//             })),
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalMessages: totalCount,
//                 hasNextPage,
//                 hasPrevPage
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         const err = new Error('Error fetching messages');
//         err.status = 400;
//         throw err;
//     }
// }
getMessages: async (req, res) => {
    try {
        const currentUserId = req.user.sub;
        const selectedUserId = req.params.userId;
        
        // Find all messages between the two users, sorted newest to oldest
        const fetchMessages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: selectedUserId },
                { sender: selectedUserId, receiver: currentUserId }
            ]
        })
        .sort({ createdAt: -1 }); // Sort from newest to oldest
        
        // If no messages found, return empty array
        if (fetchMessages.length === 0) {
            return res.status(200).json({
                message: 'No messages found',
                messages: [],
            });
        }
        
        // Update unread messages to read if they were sent to current user
        await Message.updateMany(
            { 
                sender: selectedUserId, 
                receiver: currentUserId,
                read: false 
            },
            { read: true }
        );
        
        // Map messages to desired format and send response
        res.status(200).json({
            message: 'Messages fetched successfully',
            messages: fetchMessages.map(message => ({
                id: message._id,
                sender: message.sender,
                receiver: message.receiver,
                content: message.content,
                read: message.read,
                createdAt: message.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        const err = new Error('Error fetching messages');
        err.status = 400;
        throw err;
    }
}
}