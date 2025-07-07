import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginUserSchema } from "zod-schemas/dist/schema";
import { ZodError } from "zod";
import UserCardHeader from "./userComponents/UserCardHeader";
import AuthInput from "./userComponents/AuthInput";
import SubmitButton from "./userComponents/SubmitButton";
import AuthSwitch from "./userComponents/AuthSwitch";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth";
import "../../styles/user.css";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      loginUserSchema.parse(formData); // Validate form data
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, formData, {
        withCredentials: true,
      });
      try {
        await login();
        toast.success("Login Successful: Welcome back!");
      } catch (e) {
        console.error("Login failed:", e);
        return;
      }
      console.log("Login Successful: Welcome back! Redirecting...");
      navigate("/board");
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<typeof formData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof formData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Login failed. Please try again.");
        } else {
          toast.error("Login failed. Please try again.");
        }
        console.error("Login error:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <UserCardHeader
          heading="Welcome Back"
          content="Sign in to continue to your dashboard."
        />
        <div className="login-card-content">
          <form onSubmit={handleSubmit} className="login-form">
            <AuthInput
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              label="Email Address"
              className="auth-input"
            />

            <AuthInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              label="Password"
              className="auth-input"
            />

            <SubmitButton
              loading={loading}
              text="Login Securely"
              loadingText="Logging in..."
              icon={useMemo(() => <LogIn size={18} />, [])}
            />
          </form>

          <AuthSwitch
            content="Don't have an account?"
            button="Signup"
            onSwitch={useCallback(() => navigate("/signup"), [navigate])}
          />
        </div>
      </div>
    </div>
  );
}
