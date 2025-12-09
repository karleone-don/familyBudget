#!/usr/bin/env python
"""
Test script for AI Budget Assistant

Runs all AI endpoints and validates responses.
Usage: python test_ai_service.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'family_budget.settings')
django.setup()

from family_budget_app.models import User, Finance, Transaction, Category
from family_budget_app.ai_service import BudgetAIService


def create_test_data(user):
    """Create sample transaction data for testing"""
    print("\n📊 Creating test transaction data...")
    
    # Create categories
    categories = {
        'Food & Dining': Category.objects.get_or_create(category_name='Food & Dining')[0],
        'Transportation': Category.objects.get_or_create(category_name='Transportation')[0],
        'Entertainment': Category.objects.get_or_create(category_name='Entertainment')[0],
        'Shopping': Category.objects.get_or_create(category_name='Shopping')[0],
        'Utilities': Category.objects.get_or_create(category_name='Utilities')[0],
    }
    
    finance = user.finance
    
    # Clear existing transactions
    Transaction.objects.filter(finance=finance).delete()
    
    # Create income transactions (last 60 days)
    for i in range(2):
        date = timezone.now() - timedelta(days=30*i)
        Transaction.objects.create(
            finance=finance,
            amount=Decimal('2500.00'),
            type='income',
            date=date,
            description=f'Monthly salary'
        )
    
    # Create expense transactions
    expenses = [
        # Food & Dining
        ('30.50', 'Food & Dining', 'Coffee and breakfast'),
        ('45.00', 'Food & Dining', 'Lunch at restaurant'),
        ('55.75', 'Food & Dining', 'Dinner'),
        ('120.00', 'Food & Dining', 'Groceries'),
        ('200.00', 'Food & Dining', 'Weekly groceries'),
        
        # Transportation
        ('15.00', 'Transportation', 'Gas'),
        ('12.50', 'Transportation', 'Parking'),
        ('35.00', 'Transportation', 'Uber ride'),
        ('50.00', 'Transportation', 'Gas fill-up'),
        
        # Entertainment
        ('15.99', 'Entertainment', 'Netflix subscription'),
        ('20.00', 'Entertainment', 'Movie tickets'),
        ('50.00', 'Entertainment', 'Concert ticket'),
        
        # Shopping
        ('75.00', 'Shopping', 'Clothes shopping'),
        ('40.00', 'Shopping', 'Books'),
        ('150.00', 'Shopping', 'Electronics'),
        ('500.00', 'Shopping', 'Black Friday purchase'),  # Anomaly
        
        # Utilities
        ('80.00', 'Utilities', 'Internet bill'),
        ('45.00', 'Utilities', 'Electricity'),
        
        # Unusual transaction
        ('1200.00', 'Transportation', 'Flight ticket'),  # Anomaly
    ]
    
    for i, (amount, category_name, desc) in enumerate(expenses):
        date = timezone.now() - timedelta(days=i+1)
        Transaction.objects.create(
            finance=finance,
            amount=Decimal(amount),
            type='expense',
            category=categories[category_name],
            date=date,
            description=desc
        )
    
    print(f"✅ Created {len(expenses)} expense transactions and 2 income transactions")
    return finance


def test_analyze_spending(ai_service):
    """Test spending analysis"""
    print("\n" + "="*60)
    print("🔍 TEST: analyze_spending()")
    print("="*60)
    
    result = ai_service.analyze_spending()
    
    print(f"Total Income: ${result['total_income']:.2f}")
    print(f"Total Expenses: ${result['total_expenses']:.2f}")
    print(f"Net Balance: ${result['net_balance']:.2f}")
    print(f"Avg Monthly Expense: ${result['avg_monthly_expense']:.2f}")
    print(f"Transaction Count: {result['transaction_count']}")
    print(f"Analysis Period: {result['analysis_period_days']} days")
    
    print("\n💰 By Category:")
    for category, amount in sorted(result['by_category'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: ${amount:.2f}")
    
    print("\n📈 Top Categories:")
    for category, amount in result['top_categories']:
        print(f"  {category}: ${amount:.2f}")
    
    assert result['total_income'] > 0, "Should have income"
    assert result['total_expenses'] > 0, "Should have expenses"
    assert result['transaction_count'] > 0, "Should have transactions"
    assert len(result['by_category']) > 0, "Should have categories"
    print("\n✅ Test passed!")


def test_predict_expenses(ai_service):
    """Test expense prediction"""
    print("\n" + "="*60)
    print("📊 TEST: predict_monthly_expenses()")
    print("="*60)
    
    result = ai_service.predict_monthly_expenses(months_ahead=3)
    
    print(f"Confidence Score: {result['confidence_score']:.2f}")
    print(f"Model Accuracy (R²): {result['model_accuracy']:.2f}")
    print(f"Historical Months: {result['historical_months']}")
    
    if result['predicted_expenses']:
        print(f"\n🔮 Predictions (next 3 months):")
        for month, expense, income, net in zip(
            result['prediction_months'],
            result['predicted_expenses'],
            result['predicted_income'],
            result['predicted_net']
        ):
            print(f"  {month}: Expense=${expense:.2f}, Income=${income:.2f}, Net=${net:.2f}")
    else:
        print(f"ℹ️ {result['note']}")
    
    print(f"\n📝 Note: {result['note']}")
    print("\n✅ Test passed!")


def test_recommendations(ai_service):
    """Test budget recommendations"""
    print("\n" + "="*60)
    print("💡 TEST: get_budget_recommendations()")
    print("="*60)
    
    result = ai_service.get_budget_recommendations()
    
    print(f"Total Potential Savings: ${result['total_potential_savings']:.2f}")
    print(f"\n💭 Recommendations ({len(result['recommendations'])} total):")
    
    for i, rec in enumerate(result['recommendations'], 1):
        print(f"\n  {i}. {rec['title']}")
        print(f"     Type: {rec['type']}")
        print(f"     Priority: {rec['priority']}")
        print(f"     Description: {rec['description']}")
        if rec['potential_savings'] > 0:
            print(f"     Potential Savings: ${rec['potential_savings']:.2f}")
    
    assert len(result['recommendations']) > 0, "Should have recommendations"
    print("\n✅ Test passed!")


def test_anomalies(ai_service):
    """Test anomaly detection"""
    print("\n" + "="*60)
    print("🚨 TEST: detect_anomalies()")
    print("="*60)
    
    result = ai_service.detect_anomalies(threshold=2.0)
    
    print(f"Detection Method: {result['detection_method']}")
    print(f"Anomalies Found: {result['anomaly_count']}")
    
    if result['anomalies']:
        print(f"\n⚠️  Anomalies (showing {len(result['anomalies'])}):")
        for anomaly in result['anomalies']:
            print(f"\n  Transaction ID: {anomaly['transaction_id']}")
            print(f"  Date: {anomaly['date']}")
            print(f"  Amount: ${anomaly['amount']:.2f}")
            print(f"  Category: {anomaly['category']}")
            print(f"  Description: {anomaly['description']}")
            print(f"  Severity: {anomaly['severity']}")
            print(f"  Z-Score: {anomaly['zscore']:.2f}")
            print(f"  Reason: {anomaly['reason']}")
    else:
        print(f"ℹ️ {result.get('note', 'No anomalies detected')}")
    
    print("\n✅ Test passed!")


def test_categorize_transaction(ai_service):
    """Test transaction categorization"""
    print("\n" + "="*60)
    print("🏷️  TEST: categorize_transaction()")
    print("="*60)
    
    test_descriptions = [
        "Starbucks coffee downtown",
        "Uber ride to airport",
        "Netflix monthly subscription",
        "Walmart shopping",
        "Amazon delivery",
        "Random weird description xyz",
    ]
    
    for desc in test_descriptions:
        result = ai_service.categorize_transaction(desc)
        print(f"\n📝 Description: \"{desc}\"")
        print(f"   Suggested: {result['suggested_category']} (confidence: {result['confidence']:.1%})")
        print(f"   Top alternatives:")
        for cat in result['all_categories'][:3]:
            if cat['confidence'] > 0:
                print(f"     - {cat['name']}: {cat['confidence']:.1%} {cat['keywords_matched']}")
        
        assert result['suggested_category'], "Should suggest category"
        assert 0 <= result['confidence'] <= 1.0, "Confidence should be 0-1"
    
    print("\n✅ Test passed!")


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 AI BUDGET ASSISTANT - TEST SUITE")
    print("="*60)
    
    # Get test user (use first user or create one)
    try:
        user = User.objects.first()
        if not user:
            print("❌ No users found in database. Please create a user first.")
            return
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return
    
    print(f"👤 Testing with user: {user.username} (ID: {user.user_id})")
    
    # Ensure finance record exists
    if not hasattr(user, 'finance'):
        Finance.objects.create(user=user)
        print("📝 Created finance record for user")
    
    # Create test data
    finance = create_test_data(user)
    
    # Initialize AI service
    ai_service = BudgetAIService(user)
    print(f"\n✅ AI Service initialized")
    
    # Run tests
    try:
        test_analyze_spending(ai_service)
        test_predict_expenses(ai_service)
        test_recommendations(ai_service)
        test_anomalies(ai_service)
        test_categorize_transaction(ai_service)
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
