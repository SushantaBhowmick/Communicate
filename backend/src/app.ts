
import express from 'express'
import cors from 'cors'
import dotenv from  'dotenv'
import authRoutes from './routes/authRoutes'
import userRoutes from "./routes/userRoutes";
import messageRoutes from './routes/messageRoutes'
import chatRoutes from './routes/chatRoutes'
dotenv.config()


const app = express();

// console.log(process.env.JWT_SECRET)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy and running'
    });
});


app.use('/api/auth',authRoutes);
app.use('/api/messages',messageRoutes);
app.use('/api/chats',chatRoutes);
app.use("/api/users", userRoutes);


export default app;






