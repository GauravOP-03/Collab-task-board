import { lazy } from "react";
const LoginForm = lazy(() => import("./component/User/Login"));
const SignupForm = lazy(() => import("./component/User/SignUp"));

import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";

import LoginRoute from "./routes/LoginRoute"
import { SocketProvider } from "./context/socket/SocketProvider";
import KanbanBoard from "./component/KanbanBoard/KanbanBoard";
import PrivateRoute from "./routes/PrivateRoute";
import { Toaster } from "react-hot-toast";
import NotFound from "./component/NotFound";



function App() {
  const router = createBrowserRouter([

    { path: "/signup", element: <LoginRoute><SignupForm /></LoginRoute> },
    { path: "/login", element: <LoginRoute><LoginForm /></LoginRoute> },
    { path: "/board", element: <PrivateRoute><KanbanBoard /></PrivateRoute> },
    { path: "/", element: <Navigate to={"/login"} /> },
    { path: "*", element: <NotFound /> }

  ]);
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <RouterProvider router={router} />

      </SocketProvider>

    </AuthProvider>
  );
}

export default App;
