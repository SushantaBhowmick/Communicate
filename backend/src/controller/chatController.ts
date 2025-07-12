import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createChat = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { name, isGroup, members } = req.body;
  try {
    const chat = await prisma.chat.create({
      data: {
        name: isGroup ? name : null,
        isGroup,
        ownerId: isGroup ? userId : null,
        members: {
          create: [
            { userId, role: "admin" },
            ...members.map((id: string) => ({ userId: id })),
          ],
        },
      },
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error });
  }
};
export const getuserChats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error });
  }
};

export const InviteToChat = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { chatId } = req.params;
  const { inviteUserId } = req.body;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { members: true },
  });

  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const isMember = chat.members.some((m) => m.userId === userId);
  if (!isMember) return res.status(403).json({ message: "Not a member" });

  try {
    const added = await prisma.chatMember.create({
      data: {
        chatId,
        userId: inviteUserId,
      },
    });
    res.status(201).json({ added });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error });
  }
};


export const startDirectChart = async (req: Request, res: Response) => {
     const currentUserId = (req as any).user.id;
  const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === currentUserId) {
    return res.status(400).json({ message: "Invalid target user." });
  }


    // Check for existing DM
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      members: {
       some:{userId:currentUserId}
      },
      AND:{
        members:{
            some:{userId:targetUserId}
        }
      }
    },
    include:{
        members:true,
    }
  });

    if (existingChat && existingChat.members.length === 2) {
    return res.json({ chat: existingChat });
  }
    // Create new 1-1 chat
  const chat = await prisma.chat.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: currentUserId },
          { userId: targetUserId },
        ],
      },
    },
    include:{
        members:true,
    }
  });

  res.status(201).json({ chat });
}


export const getChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = (req as any).user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  if (!chat || !chat.members.find((m) => m.userId === userId)) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ chat });
};


export const createGroupChat = async (req: Request, res: Response) => {
 
  try {
    const currentUserId = (req as any).user.id;
    const { name, userIds } = req.body;


  if (!name || !userIds || !Array.isArray(userIds) || userIds.length < 1) {
    return res.status(400).json({ message: "Name and at least 1 user are required." });
  }

  const allUserIds = Array.from(new Set([...userIds,currentUserId]));

  const chat = await prisma.chat.create({
    data:{
      name,
      isGroup:true,
      members:{
        create:allUserIds.map((id)=>({userId:id}))
      }
    },
    include:{
      members:true,
    }
  })

  res.status(201).json({chat})
    
  } catch (error) {
      res.status(500).json({message:"Failed to create group chat",error})
  }
};
