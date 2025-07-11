


import { Server,Socket } from 'socket.io';
import { registerMessageSocket } from './messageSocket';


export const registerSocketHandlers =(io:Server,socket:Socket)=>{
    const userId = socket.data.userId;
    console.log(`🔗 Socket handshake user ID: ${userId}`);

    registerMessageSocket(io,socket)

    socket.on('disconnect',()=>{
        console.log(`🔗 Socket disconnected:  ${userId}`);
    })

    // socket.on('join-room',(roomId:string)=>{
    //     socket.join(roomId);
    //     console.log(`🔗 Socket joined room: ${roomId}`);
    // })
}
