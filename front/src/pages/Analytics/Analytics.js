import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid 
} from "recharts";
import "./Analytics.css";

export default function AnalyticsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const txs = location.state?.transactions || [];
    const now = new Date();
    
    // Точка отсечки: 12 месяцев назад от начала текущего месяца
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // 1. ПИРОГ: Расходы за ПОСЛЕДНИЕ 12 МЕСЯЦЕВ (по категориям)
    const catMap = {};
    txs.forEach(t => {
      const d = new Date(t.date);
      if (t.type === "expense" && d >= twelveMonthsAgo) {
        catMap[t.category_name] = (catMap[t.category_name] || 0) + parseFloat(t.amount);
      }
    });
    const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // 2 & 3. БАРЫ: Доходы и Расходы за последние 12 месяцев
    const monthlyMap = {};
    txs.forEach(t => {
      const d = new Date(t.date);
      if (d >= twelveMonthsAgo) {
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!monthlyMap[key]) {
          monthlyMap[key] = { 
            name: key, 
            income: 0, 
            expense: 0, 
            rawDate: new Date(d.getFullYear(), d.getMonth(), 1) 
          };
        }
        if (t.type === "income") monthlyMap[key].income += parseFloat(t.amount);
        else monthlyMap[key].expense += parseFloat(t.amount);
      }
    });
    const barData = Object.values(monthlyMap).sort((a, b) => a.rawDate - b.rawDate);

    // 4. НАКОПИТЕЛЬНЫЙ БАЛАНС (за все время для точности, но отображаем последние 12 + Pred)
    let runningTotal = 0;
    // Сортируем ВСЕ транзакции от старых к новым для правильного накопления
    const allSorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const fullHistoryMap = {};
    allSorted.forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!fullHistoryMap[key]) {
        fullHistoryMap[key] = { name: key, change: 0, rawDate: new Date(d.getFullYear(), d.getMonth(), 1) };
      }
      const amt = parseFloat(t.amount);
      fullHistoryMap[key].change += (t.type === "income" ? amt : -amt);
    });

    const cumulativeHistory = Object.values(fullHistoryMap)
      .sort((a, b) => a.rawDate - b.rawDate)
      .map(m => {
        runningTotal += m.change;
        return { name: m.name, totalBalance: runningTotal, rawDate: m.rawDate, isPrediction: false };
      });

    // Фильтруем историю для отображения (только последние 12 месяцев)
    let displayPredictionData = cumulativeHistory.filter(m => m.rawDate >= twelveMonthsAgo);

    // Предсказание на 3 месяца вперед
    if (displayPredictionData.length > 1) {
      const lastPoint = displayPredictionData[displayPredictionData.length - 1];
      const firstPoint = displayPredictionData[0];
      const avgGrowth = (lastPoint.totalBalance - firstPoint.totalBalance) / (displayPredictionData.length - 1);

      for (let i = 1; i <= 3; i++) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
        displayPredictionData.push({
          name: nextMonth.toLocaleDateString("en-US", { month: "short" }) + " (Pred)",
          totalBalance: lastPoint.totalBalance + (avgGrowth * i),
          isPrediction: true
        });
      }
    }

    return { pieData, barData, predictionData: displayPredictionData };
  }, [location.state?.transactions]);

  const COLORS = ["#7D88EC", "#FF4a4a", "#27ae60", "#F2C94C", "#BB6BD9", "#56CCF2"];

  return (
    <div className="analytics-full-page">
      <button className="abs-back-btn" onClick={() => navigate(-1)}>← Exit Analytics</button>

      {/* Пирог теперь показывает расходы в сумме за последние 12 месяцев */}
      <section className="chart-section">
        <h2>Expenses by Category (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={stats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="35%" label>
              {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Monthly Incomes (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stats.barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip />
            <Bar dataKey="income" fill="#27ae60" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Monthly Expenses (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stats.barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip />
            <Bar dataKey="expense" fill="#FF4a4a" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Total Balance Trend & Prediction</h2>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={stats.predictionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip formatter={(val) => val.toFixed(2)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalBalance" 
              stroke="#7D88EC" 
              strokeWidth={5} 
              dot={(props) => {
                const { cx, cy, payload } = props;
                return payload.isPrediction ? null : <circle cx={cx} cy={cy} r={6} fill="#7D88EC" stroke="#fff" strokeWidth={2} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}