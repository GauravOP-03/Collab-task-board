import { memo } from "react";
import "../../../styles/user.css";

interface SubmitButtonProps {
    loading: boolean;
    icon: React.ReactNode;
    text: string;
    loadingText: string;
}

function SubmitButton({
    loading,
    icon,
    text,
    loadingText
}: SubmitButtonProps) {
    return (
        <button
            type="submit"
            className="submit-button"
            disabled={loading}
        >
            {loading ? loadingText : (<>{icon} {text}</>)}
        </button>
    );
}

export default memo(SubmitButton);
