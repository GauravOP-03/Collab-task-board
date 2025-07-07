import "../styles/NotFound.css"
export default function NotFound() {
    return (
        <div className="not-found-container">
            <h1 className="not-found-code">404</h1>
            <p className="not-found-text">Oops! The page you’re looking for doesn’t exist.</p>
            <a href="/" className="home-button">Go to Home</a>
        </div>
    );
}
