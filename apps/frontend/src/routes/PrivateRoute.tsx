import { useAuth } from "../context/auth/useAuth";
import { useSocket } from "../context/socket/useSocket"

import "../styles/RouteLoading.css"
interface LoginRouteProp {
    children: React.ReactNode;
}

export default function LoginRoute({ children }: LoginRouteProp) {
    const { loading } = useAuth();
    const { loading: socketLoading } = useSocket();


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





    // If user is not logged in, render the children (LoginForm)
    return <>{children}</>;
}
