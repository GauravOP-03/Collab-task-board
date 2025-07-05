import { memo } from "react";
import "../../../styles/user.css";

interface UserCardHeaderProp {
    heading: string;
    content: string;
}

function UserCardHeader({ heading, content }: UserCardHeaderProp) {
    return (
        <div className="user-card-header">
            <h1 className="user-card-heading">{heading}</h1>
            <p className="user-card-content">{content}</p>
        </div>
    );
}

export default memo(UserCardHeader);
