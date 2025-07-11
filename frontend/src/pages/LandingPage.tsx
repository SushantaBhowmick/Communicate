import { Link } from "react-router-dom";

export const LandingPage = () => {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Chatrix</h1>
        <p className="text-gray-500 mb-6">A blazing fast real-time chat platform</p>
        <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</Link>
      </div>
    );
  };
  