import { Link } from "react-router-dom";
import "./Main.css";

export default function Main() {
  return (
    <div className="main-page">
      <h1>
        Welcome to the <br/>
        Family Budget System!
      </h1>

      <Link to="/login" className="btn-main">Log in</Link>
    </div>
  );
}
