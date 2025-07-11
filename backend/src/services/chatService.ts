import prisma from "../config/prisma"



export const isUserInChat = async (userId: string, chatId: string | null | undefined) => {
  // ✅ Early return if chatId is not valid
  if (!chatId || typeof chatId !== 'string') return false;

  const member = await prisma.chatMember.findFirst({
    where: {
      userId,
      chatId,
    },
  });

  return !!member;
};