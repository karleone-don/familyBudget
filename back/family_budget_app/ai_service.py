"""
AI Budget Assistant Service

Provides intelligent financial analysis and recommendations using:
- Spending pattern analysis
- Linear regression for expense prediction
- Anomaly detection for unusual transactions
- ML-based transaction categorization
- Personalized budget recommendations
"""

from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import statistics

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

from .models import Transaction, User, Finance, Category


class BudgetAIService:
    """AI-powered budget analysis and recommendation service"""

    def __init__(self, user: User):
        """Initialize service with user context"""
        self.user = user
        self.finance = user.finance if hasattr(user, 'finance') else None
        self.transactions = self._get_transactions()

    def _get_transactions(self) -> list:
        """Fetch all transactions for the user"""
        if not self.finance:
            return []
        return list(
            Transaction.objects.filter(finance=self.finance)
            .select_related('category')
            .order_by('-date')
        )

    def analyze_spending(self) -> Dict:
        """
        Analyze spending patterns by category and time period

        Returns:
            {
                'total_expenses': Decimal,
                'total_income': Decimal,
                'by_category': {category_name: amount, ...},
                'by_month': {month: {income, expenses, net}, ...},
                'avg_monthly_expense': Decimal,
                'top_categories': [(category, amount), ...],
                'transaction_count': int,
                'analysis_period_days': int
            }
        """
        if not self.transactions:
            return {
                'total_expenses': Decimal('0'),
                'total_income': Decimal('0'),
                'by_category': {},
                'by_month': {},
                'avg_monthly_expense': Decimal('0'),
                'top_categories': [],
                'transaction_count': 0,
                'analysis_period_days': 0,
            }

        # Separate income and expenses
        expenses = [t for t in self.transactions if t.type == 'expense']
        income = [t for t in self.transactions if t.type == 'income']

        # Calculate totals
        total_expenses = sum(t.amount for t in expenses) or Decimal('0')
        total_income = sum(t.amount for t in income) or Decimal('0')

        # Analyze by category
        by_category = defaultdict(Decimal)
        for transaction in expenses:
            category_name = (
                transaction.category.category_name
                if transaction.category
                else 'Uncategorized'
            )
            by_category[category_name] += transaction.amount

        # Analyze by month
        by_month = defaultdict(lambda: {'income': Decimal('0'), 'expenses': Decimal('0')})
        for transaction in self.transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if transaction.type == 'income':
                by_month[month_key]['income'] += transaction.amount
            else:
                by_month[month_key]['expenses'] += transaction.amount

        # Calculate net for each month
        for month in by_month:
            by_month[month]['net'] = (
                by_month[month]['income'] - by_month[month]['expenses']
            )

        # Sort months chronologically
        by_month = dict(sorted(by_month.items()))

        # Calculate average monthly expense
        if by_month:
            avg_monthly = total_expenses / len(by_month)
        else:
            avg_monthly = Decimal('0')

        # Get top categories
        top_categories = sorted(
            by_category.items(), key=lambda x: x[1], reverse=True
        )[:5]

        # Calculate analysis period
        if self.transactions:
            oldest = self.transactions[-1].date
            newest = self.transactions[0].date
            period_days = (newest - oldest).days
        else:
            period_days = 0

        return {
            'total_expenses': float(total_expenses),
            'total_income': float(total_income),
            'net_balance': float(total_income - total_expenses),
            'by_category': {k: float(v) for k, v in by_category.items()},
            'by_month': {
                k: {
                    'income': float(v['income']),
                    'expenses': float(v['expenses']),
                    'net': float(v['net']),
                }
                for k, v in by_month.items()
            },
            'avg_monthly_expense': float(avg_monthly),
            'top_categories': [(cat, float(amount)) for cat, amount in top_categories],
            'transaction_count': len(self.transactions),
            'analysis_period_days': period_days,
        }

    def predict_monthly_expenses(self, months_ahead: int = 1) -> Dict:
        """
        Predict future monthly expenses using linear regression

        Args:
            months_ahead: Number of months to predict ahead

        Returns:
            {
                'predicted_expenses': [amount, ...],
                'predicted_income': [amount, ...],
                'confidence_score': float (0-1),
                'model_accuracy': float (R² score),
                'prediction_months': [month_str, ...],
                'note': str
            }
        """
        if not self.transactions or len(self.transactions) < 3:
            return {
                'predicted_expenses': [],
                'predicted_income': [],
                'confidence_score': 0.0,
                'model_accuracy': 0.0,
                'prediction_months': [],
                'note': 'Insufficient transaction history (need at least 3 transactions)',
            }

        # Group transactions by month
        monthly_data = defaultdict(lambda: {'income': Decimal('0'), 'expenses': Decimal('0')})
        for transaction in self.transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if transaction.type == 'income':
                monthly_data[month_key]['income'] += transaction.amount
            else:
                monthly_data[month_key]['expenses'] += transaction.amount

        # Sort by month
        months = sorted(monthly_data.keys())
        if len(months) < 2:
            return {
                'predicted_expenses': [],
                'predicted_income': [],
                'confidence_score': 0.0,
                'model_accuracy': 0.0,
                'prediction_months': [],
                'note': 'Need at least 2 months of data for prediction',
            }

        # Prepare data for linear regression
        X = np.array(range(len(months))).reshape(-1, 1)
        expenses_y = np.array([float(monthly_data[m]['expenses']) for m in months])
        income_y = np.array([float(monthly_data[m]['income']) for m in months])

        # Train models
        try:
            expense_model = LinearRegression()
            income_model = LinearRegression()

            expense_model.fit(X, expenses_y)
            income_model.fit(X, income_y)

            # Get model accuracy (R² score)
            expense_score = max(0, expense_model.score(X, expenses_y))
            income_score = max(0, income_model.score(X, income_y))

            # Predict next months
            future_X = np.array(
                range(len(months), len(months) + months_ahead)
            ).reshape(-1, 1)

            predicted_expenses = expense_model.predict(future_X)
            predicted_income = income_model.predict(future_X)

            # Ensure predictions are non-negative
            predicted_expenses = np.maximum(predicted_expenses, 0)
            predicted_income = np.maximum(predicted_income, 0)

            # Calculate confidence (based on historical consistency)
            expense_std = float(np.std(expenses_y))
            expense_mean = float(np.mean(expenses_y))
            confidence = (
                min(1.0, (expense_score + income_score) / 2)
                if expense_mean > 0
                else 0.5
            )

            # Generate future month labels
            last_month = datetime.strptime(months[-1], '%Y-%m')
            future_months = []
            for i in range(months_ahead):
                future_month = last_month + timedelta(days=30 * (i + 1))
                future_months.append(future_month.strftime('%Y-%m'))

            return {
                'predicted_expenses': [float(x) for x in predicted_expenses],
                'predicted_income': [float(x) for x in predicted_income],
                'predicted_net': [
                    float(income - expense)
                    for income, expense in zip(predicted_income, predicted_expenses)
                ],
                'confidence_score': float(confidence),
                'model_accuracy': float((expense_score + income_score) / 2),
                'prediction_months': future_months,
                'historical_months': len(months),
                'note': 'Based on linear trend analysis of historical data',
            }
        except Exception as e:
            return {
                'predicted_expenses': [],
                'predicted_income': [],
                'confidence_score': 0.0,
                'model_accuracy': 0.0,
                'prediction_months': [],
                'note': f'Prediction failed: {str(e)}',
            }

    def get_budget_recommendations(self) -> Dict:
        """
        Generate personalized budget recommendations based on spending patterns

        Returns:
            {
                'recommendations': [
                    {
                        'type': 'category_alert' | 'budget_tip' | 'saving_opportunity' | 'income_insight',
                        'title': str,
                        'description': str,
                        'potential_savings': float,
                        'priority': 'high' | 'medium' | 'low'
                    },
                    ...
                ],
                'total_potential_savings': float
            }
        """
        analysis = self.analyze_spending()
        recommendations = []
        total_savings = 0

        if not analysis['by_category']:
            return {
                'recommendations': [
                    {
                        'type': 'budget_tip',
                        'title': 'Start Tracking Expenses',
                        'description': 'No expense data found. Start tracking your expenses to get personalized recommendations.',
                        'potential_savings': 0,
                        'priority': 'low',
                    }
                ],
                'total_potential_savings': 0,
            }

        # Check for high-spending categories
        top_category = analysis['top_categories'][0] if analysis['top_categories'] else None
        if top_category:
            category_name, amount = top_category
            avg_monthly = analysis['avg_monthly_expense']
            if amount > avg_monthly * 0.3:
                potential_savings = amount * 0.1  # 10% reduction
                recommendations.append(
                    {
                        'type': 'category_alert',
                        'title': f'High Spending in {category_name}',
                        'description': f'${amount:.2f} on {category_name} is {((amount / avg_monthly - 1) * 100):.0f}% above average. Consider reducing by 10%.',
                        'potential_savings': potential_savings,
                        'priority': 'high',
                    }
                )
                total_savings += potential_savings

        # Check income vs expenses ratio
        total_income = analysis['total_income']
        total_expenses = analysis['total_expenses']
        if total_income > 0:
            expense_ratio = total_expenses / total_income
            if expense_ratio > 0.9:
                recommendations.append(
                    {
                        'type': 'budget_tip',
                        'title': 'High Expense-to-Income Ratio',
                        'description': f'You spend {(expense_ratio * 100):.0f}% of your income. Try to keep it below 80%.',
                        'potential_savings': total_expenses * 0.1,
                        'priority': 'high',
                    }
                )
                total_savings += total_expenses * 0.1
            elif expense_ratio < 0.6:
                recommendations.append(
                    {
                        'type': 'income_insight',
                        'title': 'Great Savings Rate!',
                        'description': f'You save {((1 - expense_ratio) * 100):.0f}% of your income. Keep it up!',
                        'potential_savings': 0,
                        'priority': 'low',
                    }
                )

        # Check for category diversification
        num_categories = len(analysis['by_category'])
        if num_categories == 1:
            recommendations.append(
                {
                    'type': 'budget_tip',
                    'title': 'Diversify Your Spending',
                    'description': 'All expenses are in one category. Consider categorizing transactions more granularly for better insights.',
                    'potential_savings': 0,
                    'priority': 'medium',
                }
            )
        elif num_categories > 8:
            recommendations.append(
                {
                    'type': 'budget_tip',
                    'title': 'Consolidate Categories',
                    'description': f'You have {num_categories} expense categories. Consider grouping related ones for clearer analysis.',
                    'potential_savings': 0,
                    'priority': 'low',
                }
            )

        # Suggest emergency fund
        if total_income > 0:
            monthly_income = total_income / max(analysis['analysis_period_days'] / 30, 1)
            emergency_fund = monthly_income * 3
            recommendations.append(
                {
                    'type': 'saving_opportunity',
                    'title': f'Build Emergency Fund (${emergency_fund:.2f})',
                    'description': f'Aim to save 3 months of income (${emergency_fund:.2f}). Start with 5-10% of monthly income.',
                    'potential_savings': 0,
                    'priority': 'medium',
                }
            )

        return {
            'recommendations': recommendations,
            'total_potential_savings': total_savings,
        }

    def detect_anomalies(self, threshold: float = 2.0) -> Dict:
        """
        Detect unusual transactions using statistical methods

        Args:
            threshold: Standard deviations from mean to flag as anomaly

        Returns:
            {
                'anomalies': [
                    {
                        'transaction_id': int,
                        'date': str,
                        'amount': float,
                        'category': str,
                        'description': str,
                        'reason': str,
                        'severity': 'low' | 'medium' | 'high',
                        'zscore': float
                    },
                    ...
                ],
                'detection_method': str,
                'anomaly_count': int
            }
        """
        anomalies = []

        if len(self.transactions) < 3:
            return {
                'anomalies': [],
                'detection_method': 'statistical',
                'anomaly_count': 0,
                'note': 'Need at least 3 transactions to detect anomalies',
            }

        # Group by category and find anomalies within each
        by_category = defaultdict(list)
        for transaction in self.transactions:
            category_name = (
                transaction.category.category_name
                if transaction.category
                else 'Uncategorized'
            )
            by_category[category_name].append(transaction)

        for category_name, transactions in by_category.items():
            if len(transactions) < 3:
                continue

            amounts = np.array([float(t.amount) for t in transactions])
            mean = np.mean(amounts)
            std = np.std(amounts)

            if std == 0:
                continue

            for transaction in transactions:
                zscore = (float(transaction.amount) - mean) / std

                if abs(zscore) >= threshold:
                    # Determine severity
                    if abs(zscore) >= 3:
                        severity = 'high'
                    elif abs(zscore) >= 2:
                        severity = 'medium'
                    else:
                        severity = 'low'

                    reason = (
                        f'Amount ${float(transaction.amount):.2f} is {abs(zscore):.1f}x '
                        f'standard deviations from average (${mean:.2f}) in {category_name}'
                    )

                    anomalies.append(
                        {
                            'transaction_id': transaction.transaction_id,
                            'date': transaction.date.isoformat(),
                            'amount': float(transaction.amount),
                            'category': category_name,
                            'description': transaction.description,
                            'reason': reason,
                            'severity': severity,
                            'zscore': float(zscore),
                        }
                    )

        # Sort by severity and zscore
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        anomalies.sort(
            key=lambda x: (severity_order[x['severity']], -abs(x['zscore']))
        )

        return {
            'anomalies': anomalies[:10],  # Top 10 anomalies
            'detection_method': 'statistical (z-score)',
            'anomaly_count': len(anomalies),
        }

    def categorize_transaction(self, description: str) -> Dict:
        """
        Auto-categorize a transaction based on description

        Args:
            description: Transaction description text

        Returns:
            {
                'suggested_category': str,
                'confidence': float (0-1),
                'all_categories': [
                    {
                        'name': str,
                        'confidence': float,
                        'keywords_matched': [str, ...]
                    },
                    ...
                ]
            }
        """
        description_lower = description.lower()

        # Predefined category keywords
        category_keywords = {
            'Food & Dining': [
                'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'groceries',
                'supermarket', 'market', 'lunch', 'dinner', 'breakfast', 'fast food',
                'diner', 'bakery', 'bistro', 'food delivery', 'uber eats', 'doordash'
            ],
            'Transportation': [
                'gas', 'fuel', 'car', 'uber', 'lyft', 'taxi', 'bus', 'metro',
                'parking', 'toll', 'public transport', 'train', 'flight', 'airline',
                'transit', 'bicycle', 'motorcycle'
            ],
            'Entertainment': [
                'movie', 'cinema', 'concert', 'music', 'game', 'xbox', 'playstation',
                'spotify', 'netflix', 'disney', 'hulu', 'tickets', 'show', 'theater',
                'streaming', 'entertainment'
            ],
            'Shopping': [
                'mall', 'store', 'shop', 'amazon', 'ebay', 'retail', 'clothing',
                'apparel', 'fashion', 'department store', 'boutique', 'outlet'
            ],
            'Utilities': [
                'electricity', 'water', 'gas bill', 'internet', 'phone', 'mobile',
                'utility', 'bill', 'power', 'broadband', 'wifi'
            ],
            'Healthcare': [
                'pharmacy', 'doctor', 'hospital', 'medical', 'clinic', 'dental',
                'dentist', 'medicine', 'drug', 'health', 'therapy', 'healthcare'
            ],
            'Education': [
                'school', 'university', 'college', 'tuition', 'course', 'books',
                'education', 'training', 'class', 'lesson', 'student'
            ],
            'Fitness': [
                'gym', 'fitness', 'yoga', 'trainer', 'sports', 'athletic',
                'workout', 'exercise', 'health club'
            ],
            'Other': []
        }

        # Calculate confidence scores
        scores = {}
        matched_keywords = {}

        for category, keywords in category_keywords.items():
            if not keywords:
                scores[category] = 0
                matched_keywords[category] = []
                continue

            matched = [kw for kw in keywords if kw in description_lower]
            confidence = len(matched) / len(keywords) if keywords else 0
            scores[category] = confidence
            matched_keywords[category] = matched

        # Get top categories
        sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_category = sorted_categories[0]

        result = {
            'suggested_category': top_category[0],
            'confidence': float(top_category[1]),
            'all_categories': [
                {
                    'name': cat,
                    'confidence': float(score),
                    'keywords_matched': matched_keywords.get(cat, []),
                }
                for cat, score in sorted_categories
                if score > 0 or cat == 'Other'
            ][:5],  # Top 5 categories
        }

        return result
