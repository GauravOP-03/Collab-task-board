import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";
import { useSocket } from "../context/socket/useSocket"

import "../styles/RouteLoading.css"
import { toast } from "react-hot-toast";
import { useRef } from "react";
interface LoginRouteProp {
    children: React.ReactNode;
}

export default function LoginRoute({ children }: LoginRouteProp) {
    const { loading, user } = useAuth();
    const { loading: socketLoading } = useSocket();
    const navigate = useNavigate();
    const showed = useRef(false);


    if (loading || socketLoading) {
        return (
            <div className="route-loading">
                <div className="dots">
                    <span></span><span></span><span></span>
                </div>
                <p>Loading workspace...</p>
            </div>
        );
    }



    if (!loading && !user && !showed.current) {
        navigate("/login")
        toast.error("Session expired login again!")
        showed.current = true;
    }

    // If user is not logged in, render the children (LoginForm)
    return <>{children}</>;
}
