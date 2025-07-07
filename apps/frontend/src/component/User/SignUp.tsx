import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerUserSchema } from "zod-schemas/dist/schema";
import { ZodError } from "zod";
import { UserPlus } from "lucide-react";
import AuthInput from "./userComponents/AuthInput";
import SubmitButton from "./userComponents/SubmitButton";
import UserCardHeader from "./userComponents/UserCardHeader";
import AuthSwitch from "./userComponents/AuthSwitch";
import { useAuth } from "../../context/auth/useAuth";
import "../../styles/user.css";
import toast from "react-hot-toast";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { login } = useAuth();
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    try {
      registerUserSchema.parse(formData);
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }, { withCredentials: true });

      try {
        await login();
        toast.success("Account Created! Redirecting...");
      } catch (e) {
        console.error("Login failed:", e);
        return;
      }

      console.log("Account Created! Redirecting...");
      navigate("/board");

    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<typeof formData> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof typeof formData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(error) && error.response) {
        console.error("Signup Failed:", error.response.data?.message || "An error occurred on the server.");
        toast.error(error.response.data?.message || "Signup failed. Please try again.");
      } else {
        console.error("Signup error:", error);
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <UserCardHeader
          heading="Create Your Account"
          content="Join us and start your journey!"
        />

        <div className="signup-card-content">
          <form onSubmit={handleSubmit} className="signup-form">
            <AuthInput
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              error={errors.username}
              label="Username"
              className="auth-input"
            />

            <AuthInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              error={errors.email}
              label="Email Address"
              className="auth-input"
            />

            <AuthInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              error={errors.password}
              label="Password"
              className="auth-input"
            />

            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              error={errors.confirmPassword}
              label="Confirm Password"
              className="auth-input"
            />

            <div className="submit-button-wrapper">
              <SubmitButton
                loading={loading}
                icon={useMemo(() => <UserPlus size={18} />, [])}
                text="Create Account"
                loadingText="Creating Account..."
              />
            </div>
          </form>

          <AuthSwitch
            button="Login"
            onSwitch={useCallback(() => navigate("/login"), [navigate])}
            content="Already have an account?"
          />
        </div>
      </div>
    </div>
  );
}
