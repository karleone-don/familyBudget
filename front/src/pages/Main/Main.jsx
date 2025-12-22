import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./Main.css";

export default function Main() {
  const { t } = useTranslation();

  return (
    <div className="main-page">
      <h1>
        {t("Welcome to the Family Budget System!")}
      </h1>

      <Link to="/login" className="btn-main">{t("Log in")}</Link>
    </div>
  );
}
