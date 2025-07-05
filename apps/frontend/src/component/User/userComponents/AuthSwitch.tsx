import { memo } from "react";
import "../../../styles/user.css";

interface AuthSwitchProp {
    onSwitch: () => void;
    content: string;
    button: string;
}

function AuthSwitch({ onSwitch, content, button }: AuthSwitchProp) {
    return (
        <p className="auth-switch">
            {content}{" "}
            <span
                onClick={onSwitch}
                className="auth-switch-button"
            >
                {button}
            </span>
        </p>
    );
}

export default memo(AuthSwitch);
