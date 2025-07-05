import { useAuth } from "../context/auth/useAuth";
import { useSocket } from "../context/socket/useSocket"
import { Loader2 } from "lucide-react";


interface LoginRouteProp {
    children: React.ReactNode;
}

export default function LoginRoute({ children }: LoginRouteProp) {
    const { loading } = useAuth();
    const { loading: socketLoading } = useSocket();


    if (loading || socketLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
                <span className="text-lg text-muted-foreground">Loading elements...</span>
            </div>
        );
    }



    // If user is not logged in, render the children (LoginForm)
    return <>{children}</>;
}
