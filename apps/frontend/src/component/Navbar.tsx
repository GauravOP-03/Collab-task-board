import React, { useState, useEffect, useRef } from "react";
import { LogOut, Menu, ListChecks } from "lucide-react";
import { useAuth } from "../context/auth/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/Navbar.css";

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            toast.error("Failed to logout. Please try again.");
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo">
                <ListChecks size={20} /> Collab Todo
            </div>

            {/* User Info & Dropdown */}
            <div className="navbar-right">
                {user && (
                    <div className="user-menu" ref={dropdownRef}>
                        <div
                            className="user-avatar"
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>

                        {isDropdownOpen && (
                            <div className="user-dropdown">
                                <p className="user-name">{user.username}</p>
                                <p className="user-email">{user.email}</p>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hamburger for mobile */}
            <button
                className="hamburger"
                aria-label="Toggle Menu"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
                <Menu size={20} />
            </button>
        </nav>
    );
};

export default Navbar;
