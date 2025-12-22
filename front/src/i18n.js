import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navbar
      "Profile": "Profile",
      "Finance": "Finance",
      "Analytics": "Analytics",
      "AI Recommendations": "AI Recommendations",
      "Logout": "Logout",
      "Language": "Language",

      // Login
      "E-mail": "E-mail",
      "Password": "Password",
      "Sign in": "Sign in",
      "Signing in...": "Signing in...",
      "Join now": "Join now",

      // Register
      "Email": "Email",
      "username": "username",
      "password": "password",
      "password confirm": "password confirm",
      "Sign up": "Sign up",
      "Signing up...": "Signing up...",
      "Log in": "Log in",

      // Main
      "Welcome to the Family Budget System!": "Welcome to the Family Budget System!",
      "Log in": "Log in",

      // Profile
      "Нет токена. Пользователь не авторизован.": "Нет токена. Пользователь не авторизован.",
      "Ошибка загрузки профиля": "Ошибка загрузки профиля",
      "Загрузка профиля...": "Загрузка профиля...",
      "Имя пользователя": "Имя пользователя",
      "Email": "Email",
      "Возраст": "Возраст",
      "Сохранение...": "Сохранение...",
      "Сохранить": "Сохранить",
      "Отмена": "Отмена",
      "Family": "Family",
      "No family": "No family",
      "Find family": "Find family",
      "Invitations": "Invitations",
      "Change Data": "Change Data",
      "Finance tracker": "Finance tracker",
      "Ошибка при сохранении профиля": "Ошибка при сохранении профиля",

      // Finance
      "Loading...": "Loading...",
      "Current Balance:": "Current Balance:",
      "Incomes:": "Incomes:",
      "Expenses:": "Expenses:",
      "Today": "Today",
      "Last week": "Last week",
      "Add Transaction": "Add Transaction",
      "View Analytics": "View Analytics",
      "Profile": "Profile",

      // Transaction Modal
      "Edit Entry": "Edit Entry",
      "New Entry": "New Entry",
      "Info": "Info",
      "Description": "Description",
      "Sum": "Sum",
      "Cat": "Cat",
      "Select Category": "Select Category",
      "Type": "Type",
      "Expense": "Expense",
      "Income": "Income",
      "When": "When",
      "Delete": "Delete",
      "Confirm": "Confirm",
      "Close": "Close",

      // Analytics
      "← Exit Analytics": "← Exit Analytics",
      "Expenses by Category (Last 12 Months)": "Expenses by Category (Last 12 Months)",
      "Monthly Incomes (Last 12 Months)": "Monthly Incomes (Last 12 Months)",
      "Monthly Expenses (Last 12 Months)": "Monthly Expenses (Last 12 Months)",
      "Total Balance Trend & Prediction": "Total Balance Trend & Prediction",

      // AI Recommendations
      "🤖 AI Financial Advisor": "🤖 AI Financial Advisor",
      "Get personalized financial recommendations powered by AI": "Get personalized financial recommendations powered by AI",
      "Welcome to Your AI Financial Advisor": "Welcome to Your AI Financial Advisor",
      "Our advanced AI analyzes your spending patterns and financial data to provide personalized recommendations including:": "Our advanced AI analyzes your spending patterns and financial data to provide personalized recommendations including:",
      "✨ Which expense categories should be limited": "✨ Which expense categories should be limited",
      "💰 Strategies to increase your income": "💰 Strategies to increase your income",
      "🎯 Savings opportunities tailored to you": "🎯 Savings opportunities tailored to you",
      "⚡ Quick wins you can implement this week": "⚡ Quick wins you can implement this week",
      "🚀 Long-term financial goals and planning": "🚀 Long-term financial goals and planning",
      "Generating... ⏳": "Generating... ⏳",
      "Generate My Recommendations": "Generate My Recommendations",
      "Balance": "Balance",
      "Total Income": "Total Income",
      "Total Expenses": "Total Expenses",
      "💳 Your Expense Breakdown": "💳 Your Expense Breakdown",
      "Loading recommendations...": "Loading recommendations...",
      "Regenerating... ⏳": "Regenerating... ⏳",
      "🔄 Get New Recommendations": "🔄 Get New Recommendations",
      "Dismiss": "Dismiss",

      // Invitations Modal
      "Family Invitations": "Family Invitations",
      "Loading invitations...": "Loading invitations...",
      "You have no pending invitations": "You have no pending invitations",
      "Invited by: Unknown": "Invited by: Unknown",
      "Accept": "Accept",
      "Decline": "Decline"
    }
  },
  ru: {
    translation: {
      // Navbar
      "Profile": "Профиль",
      "Finance": "Финансы",
      "Analytics": "Аналитика",
      "AI Recommendations": "AI Рекомендации",
      "Logout": "Выйти",
      "Language": "Язык",

      // Login
      "E-mail": "Электронная почта",
      "Password": "Пароль",
      "Sign in": "Войти",
      "Signing in...": "Вход...",
      "Join now": "Присоединиться",

      // Register
      "Email": "Электронная почта",
      "username": "имя пользователя",
      "password": "пароль",
      "password confirm": "подтверждение пароля",
      "Sign up": "Регистрация",
      "Signing up...": "Регистрация...",
      "Log in": "Войти",

      // Main
      "Welcome to the Family Budget System!": "Добро пожаловать в систему семейного бюджета!",
      "Log in": "Войти",

      // Profile
      "Нет токена. Пользователь не авторизован.": "Нет токена. Пользователь не авторизован.",
      "Ошибка загрузки профиля": "Ошибка загрузки профиля",
      "Загрузка профиля...": "Загрузка профиля...",
      "Имя пользователя": "Имя пользователя",
      "Email": "Электронная почта",
      "Возраст": "Возраст",
      "Сохранение...": "Сохранение...",
      "Сохранить": "Сохранить",
      "Отмена": "Отмена",
      "Family": "Семья",
      "No family": "Нет семьи",
      "Find family": "Найти семью",
      "Invitations": "Приглашения",
      "Change Data": "Изменить данные",
      "Finance tracker": "Финансовый трекер",
      "Ошибка при сохранении профиля": "Ошибка при сохранении профиля",

      // Finance
      "Loading...": "Загрузка...",
      "Current Balance:": "Текущий баланс:",
      "Incomes:": "Доходы:",
      "Expenses:": "Расходы:",
      "Today": "Сегодня",
      "Last week": "Прошлая неделя",
      "Add Transaction": "Добавить транзакцию",
      "View Analytics": "Просмотр аналитики",
      "Profile": "Профиль",

      // Transaction Modal
      "Edit Entry": "Редактировать запись",
      "New Entry": "Новая запись",
      "Info": "Информация",
      "Description": "Описание",
      "Sum": "Сумма",
      "Cat": "Категория",
      "Select Category": "Выберите категорию",
      "Type": "Тип",
      "Expense": "Расход",
      "Income": "Доход",
      "When": "Когда",
      "Delete": "Удалить",
      "Confirm": "Подтвердить",
      "Close": "Закрыть",

      // Analytics
      "← Exit Analytics": "← Выйти из аналитики",
      "Expenses by Category (Last 12 Months)": "Расходы по категориям (последние 12 месяцев)",
      "Monthly Incomes (Last 12 Months)": "Месячные доходы (последние 12 месяцев)",
      "Monthly Expenses (Last 12 Months)": "Месячные расходы (последние 12 месяцев)",
      "Total Balance Trend & Prediction": "Тренд общего баланса и прогноз",

      // AI Recommendations
      "🤖 AI Financial Advisor": "🤖 AI Финансовый советник",
      "Get personalized financial recommendations powered by AI": "Получите персональные финансовые рекомендации на базе ИИ",
      "Welcome to Your AI Financial Advisor": "Добро пожаловать к вашему AI финансовому советнику",
      "Our advanced AI analyzes your spending patterns and financial data to provide personalized recommendations including:": "Наш продвинутый ИИ анализирует ваши модели расходов и финансовые данные, чтобы предоставить персональные рекомендации, включая:",
      "✨ Which expense categories should be limited": "✨ Какие категории расходов следует ограничить",
      "💰 Strategies to increase your income": "💰 Стратегии увеличения дохода",
      "🎯 Savings opportunities tailored to you": "🎯 Возможности сбережений, адаптированные для вас",
      "⚡ Quick wins you can implement this week": "⚡ Быстрые победы, которые вы можете реализовать на этой неделе",
      "🚀 Long-term financial goals and planning": "🚀 Долгосрочные финансовые цели и планирование",
      "Generating... ⏳": "Генерация... ⏳",
      "Generate My Recommendations": "Сгенерировать мои рекомендации",
      "Balance": "Баланс",
      "Total Income": "Общий доход",
      "Total Expenses": "Общие расходы",
      "💳 Your Expense Breakdown": "💳 Разбивка ваших расходов",
      "Loading recommendations...": "Загрузка рекомендаций...",
      "Regenerating... ⏳": "Перегенерация... ⏳",
      "🔄 Get New Recommendations": "🔄 Получить новые рекомендации",
      "Dismiss": "Закрыть",

      // Invitations Modal
      "Family Invitations": "Семейные приглашения",
      "Loading invitations...": "Загрузка приглашений...",
      "You have no pending invitations": "У вас нет ожидающих приглашений",
      "Invited by: Unknown": "Приглашен: Неизвестно",
      "Accept": "Принять",
      "Decline": "Отклонить"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;