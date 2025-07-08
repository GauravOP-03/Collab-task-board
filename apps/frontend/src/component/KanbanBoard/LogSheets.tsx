import { useState } from "react";

import "../../styles/LogSheets.css";
import axiosInstance from "../../lib/axiosInstance";
interface logsType {
    message: string;
    createdAt: string;
}
const LogSheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<logsType[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("tasks/logs");
            setLogs(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        fetchLogs();
    };

    return (
        <>
            <button className="open-btn" onClick={handleOpen}>
                Show Logs
            </button>

            <div
                className={`sheet-overlay ${isOpen ? "show" : ""}`}
                onClick={() => setIsOpen(false)}
            />

            <div className={`sheet ${isOpen ? "show" : ""}`}>
                <div className="sheet-header">
                    <h2>Activity Logs</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        ✕
                    </button>
                </div>
                <div className="sheet-body">
                    {loading ? (
                        <div className="loader">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <p className="no-logs">No logs found.</p>
                    ) : (
                        <ul>
                            {logs.map((log, index) => (
                                <li key={index} className="log-item">
                                    {log.message}
                                    <span className="log-time">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default LogSheet;
