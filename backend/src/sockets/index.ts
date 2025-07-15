


import { Server,Socket } from 'socket.io';
import { registerMessageSocket } from './messageSocket';
import prisma from '../config/prisma';

// Export io instance for use in controllers
let socketServer: Server;

export const setSocketServer = (io: Server) => {
    socketServer = io;
};

export const getSocketServer = () => socketServer;

// Helper function to update user presence
const updateUserPresence = async (userId: string, isOnline: boolean) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline,
                lastSeen: new Date(),
            },
        });

        // Emit presence update to users who share chats with this user
        const userChats = await prisma.chatMember.findMany({
            where: { userId },
            include: {
                chat: {
                    include: {
                        members: {
                            where: { userId: { not: userId } },
                            select: { userId: true }
                        }
                    }
                }
            }
        });

        // Get unique user IDs who share chats with this user
        const contactUserIds = new Set<string>();
        userChats.forEach(chatMember => {
            chatMember.chat.members.forEach(member => {
                contactUserIds.add(member.userId);
            });
        });

        // Emit presence update to these users
        const io = getSocketServer();
        if (io) {
            contactUserIds.forEach(contactUserId => {
                io.to(`user:${contactUserId}`).emit('user:presence', {
                    userId,
                    isOnline,
                    lastSeen: new Date(),
                });
            });
        }
    } catch (error) {
        console.error('Error updating user presence:', error);
    }
};

export const registerSocketHandlers =(io:Server,socket:Socket)=>{
    const userId = socket.data.userId;
    console.log(`🔗 Socket handshake user ID: ${userId}`);

    // Join user to their personal notification room
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined personal room: user:${userId}`);

    // Update user to online status
    updateUserPresence(userId, true);

    registerMessageSocket(io,socket)

    socket.on('disconnect',()=>{
        console.log(`🔗 Socket disconnected:  ${userId}`);
        // Update user to offline status
        updateUserPresence(userId, false);
    })

    // socket.on('join-room',(roomId:string)=>{
    //     socket.join(roomId);
    //     console.log(`🔗 Socket joined room: ${roomId}`);
    // })
}
