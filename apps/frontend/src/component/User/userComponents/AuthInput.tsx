import { memo } from "react";
import "../../../styles/user.css";

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
  label: string;
  className?: string;
}

function AuthInput({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  required,
  label,
  className = ""
}: AuthInputProps) {
  return (
    <div className={`auth-input ${className}`}>
      <label htmlFor={id} className="auth-label">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="auth-field"
      />
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}

export default memo(AuthInput);
