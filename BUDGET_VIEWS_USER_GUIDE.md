# Budget Views - User Guide

## Overview

The FamilyBudget application now includes three comprehensive expense management views tailored to different user roles:

1. **Solo View** - For personal expense tracking
2. **Family View** - For family-wide expense overview
3. **Family Member View** - For individual member profiles with role-based access

---

## 🏠 Solo View (`/solo`)

### Who Can Access:
- ✅ All logged-in users
- ✅ Both solo users and family members

### What You'll See:

#### 1. **Summary Cards**
Three key metrics displayed at the top:
- **Total Expenses:** Sum of all your personal expenses
- **Transaction Count:** Number of expense transactions
- **Average Per Transaction:** Total divided by count

#### 2. **Spending by Category**
Visual breakdown of your expenses organized by category:
- Each category shows:
  - Category name
  - Total amount spent
  - Percentage bar showing proportion of total

#### 3. **Filter by Category**
Dropdown selector to view transactions for a specific category:
- "All" - Shows all transactions
- Individual categories - Filtered view

#### 4. **Transaction List**
Complete list of your expense transactions:
- **Description:** What you spent on
- **Category:** Expense category
- **Date:** When the transaction occurred
- **Amount:** Cost in currency

### Example Workflow:
1. Navigate to `/solo` or click "My Expenses"
2. View your total spending in summary cards
3. Check category breakdown to identify high-spending areas
4. Use category filter to drill down into specific spending
5. Review detailed transactions for any category

### Tips:
- 💡 The highest spending categories appear first in the breakdown
- 💡 Hover over transactions for visual highlighting
- 💡 The percentage bars help identify your biggest expenses at a glance

---

## 👨‍👩‍👧‍👦 Family View (`/family`)

### Who Can Access:
- ✅ Family members only (users with a family assigned)
- ❌ Solo users (without family)
- ❌ Users not logged in

### What You'll See:

#### 1. **Summary Cards**
Family-wide financial metrics:
- **Total Family Expenses:** Combined expenses of all family members
- **Member Count:** Number of people in the family
- **Average Per Member:** Total expenses divided by member count

#### 2. **Member Breakdown**
Shows how much each family member has spent:
- Each member's total expenses
- Percentage of family budget they represent
- Visual percentage bars for easy comparison
- Sorted by amount (highest spenders first)

#### 3. **Category Breakdown**
Family-wide spending by category:
- Total spent by category across all members
- Percentage of family budget
- Visual bars for comparison

#### 4. **Filter by Member**
Dropdown to filter transactions by specific family member:
- Shows all transactions for selected member
- Helps understand individual spending patterns
- Updates transaction list below

#### 5. **Family Transactions List**
All family expenses with member attribution:
- **Member Name:** Who made the expense
- **Category:** Type of expense
- **Date:** When it occurred
- **Amount:** Cost

### Example Workflow:
1. Navigate to `/family` from main menu
2. Review family spending in summary cards
3. Check member breakdown - who's spending the most?
4. Analyze category breakdown - what are family priorities?
5. Use member filter to drill down:
   - Select "John" to see only John's transactions
   - Select "Sarah" to see only Sarah's transactions
   - Select "All" to see everything again

### Tips:
- 💡 The percentage bars help visualize who contributes most to family expenses
- 💡 Use member filter to identify spending patterns by person
- 💡 Category breakdown shows if family budget is balanced across needs
- 💡 Great for discussing family financial goals

---

## 👤 Family Member View (`/family-member`)

### Who Can Access:
- ✅ All family members (can view personal profile)
- ✅ Non-kids (can view other members' profiles)
- ❌ Kids (limited to personal expenses only)
- ❌ Solo users (without family)

### What You'll See:

#### 1. **Profile Header**
User information display:
- **Username:** Your name/identifier
- **Role:** Your role in the family (Admin/Family Member/Kid)
- **Family Name:** Name of your family group

#### 2. **View Mode Toggle** (Non-kids only)
Two view modes available for non-kid users:
- **"My Expenses"** - Your personal spending summary
- **"Family Overview"** - Family-wide view with member selection

#### 3. **Summary Cards**

**In "My Expenses" mode:**
- My Total Expenses
- My Transaction Count
- Family Total (context)
- My Share (percentage of family budget)

**In "Family Overview" mode:**
- Same as above, updates when you change selected member

#### 4. **Member Selector** (Family overview mode, non-kids only)
Dropdown to view any family member's expenses:
- Shows member name and role
- Switch between members instantly
- Updates all data below when selection changes

#### 5. **Spending by Category**
Detailed breakdown of expense categories:
- For your expenses (in "My Expenses" mode)
- For selected member's expenses (in "Family Overview" mode)
- Shows amount and percentage

#### 6. **Transaction List**
Detailed transaction history:
- **Description:** What was purchased
- **Category:** Expense type
- **Date:** When purchased
- **Amount:** Cost

### Example Workflow - Non-Kid User:

1. Navigate to Family Member view
2. See your profile and role at top
3. Check summary cards - your spending vs family total
4. Explore "My Expenses" mode first
   - Review your categories and transactions
5. Switch to "Family Overview" mode
6. Select different family member from dropdown
7. Compare spending patterns between members
8. Return to "My Expenses" for personal review

### Example Workflow - Kid User:

1. Navigate to Family Member view
2. See your profile and role ("kid")
3. View toggle is hidden (only your expenses available)
4. See your personal summary cards
5. Review your spending by category
6. Check your transactions
7. No access to other members' data

### Access Control Rules:

**For Kids (role = "kid"):**
- Can only see personal expenses
- "My Expenses" mode only
- Cannot select other members
- View mode toggle is hidden
- Summary cards show only personal data

**For Family Members (role = "family_member"):**
- Can see own personal expenses
- Can see other members' expenses
- Both "My Expenses" and "Family Overview" modes
- Member selector available and functional
- Summary cards adapt based on selected member

**For Admins (role = "admin"):**
- Same access as family members
- Can manage family settings (when implemented)
- Full visibility across entire family

### Tips:
- 💡 Kids: This is your personal budget tracker
- 💡 Adults: Use to teach kids about money management
- 💡 Adults: Compare your spending to other adults in family
- 💡 Use categories to identify spending patterns
- 💡 Share this view with family to discuss budgets together

---

## 🔄 Data Synchronization

All views pull fresh data when you navigate to them:
- Summary calculations are real-time
- Transaction lists are current
- Category breakdowns reflect latest data
- No manual refresh needed
- Loading states show while data fetches

---

## 🛡️ Privacy & Permissions

### What You Can See:

**Solo Users:**
- Only their own expenses
- Cannot see any family data

**Kids:**
- Only their own expenses
- Cannot see other family members' data
- Cannot see family overview

**Family Members:**
- Their own expenses (always)
- Other members' expenses (in family view)
- Family overview and totals

**Admins:**
- Full access to all data
- Can see all members' expenses
- Can see family overview
- Can manage family settings

---

## 📊 Understanding the Charts

### Category Bars
- **Length:** Represents percentage of total spending
- **Color:** Gradient from purple to pink
- **Hover:** Highlights the category
- **Use:** Identify largest spending categories quickly

### Member Bars (Family View)
- **Length:** Represents member's share of family budget
- **Color:** Gradient from purple to pink
- **Use:** See who spends the most in family

### Share Percentage (FamilyMember View)
- **Shows:** Your percentage of family total
- **Calculation:** Your expenses ÷ Family total × 100
- **Use:** Understand your financial contribution to family

---

## 🔄 Navigation Between Views

### From Main Dashboard:
1. Click "My Expenses" → Solo View
2. Click "Family Budget" → Family View (if in family)
3. Click "My Profile" → FamilyMember View

### URL Navigation:
- `/solo` - Solo expenses
- `/family` - Family overview
- `/family-member/{userId}` - Specific member profile

---

## ⚙️ Settings & Customization

### Category Filter (Solo & Family Views)
- Click dropdown to expand options
- Select category to filter
- Select "All" to reset filter
- Filter updates transaction list instantly

### Member Filter (Family View)
- Click dropdown to expand member list
- Each member shows their role
- Select member to filter transactions
- "All" option shows combined view

### Member Selector (FamilyMember Family Overview)
- Shows all family members
- Click to switch profiles
- All data updates automatically
- Your profile always highlighted

---

## 🐛 Troubleshooting

### View Not Loading
- ✓ Check internet connection
- ✓ Make sure you're logged in (check top-right)
- ✓ Verify you have family assigned (for family/member views)
- ✓ Try refreshing the page

### No Data Showing
- ✓ You may not have any transactions yet
- ✓ Check filter settings (might be filtering out everything)
- ✓ Wait for data to load (look for loading message)
- ✓ Check you're in the right view for your role

### Incorrect Totals
- ✓ Calculations happen in real-time
- ✓ Try refreshing the page
- ✓ Check that transactions have proper categories
- ✓ Verify transaction amounts are correct in system

### Can't See Other Members
- ✓ Only non-kids can view other members
- ✓ Check your role (top-right or profile page)
- ✓ Make sure you're in family overview mode (non-kids only)

---

## 💡 Best Practices

1. **Regular Monitoring**
   - Check your solo view weekly
   - Review family view monthly
   - Discuss family spending with household

2. **Category Management**
   - Use consistent category names
   - Create categories for your needs
   - Review and consolidate categories periodically

3. **Family Budgeting**
   - Set category budgets in family view
   - Monitor member spending patterns
   - Discuss outliers with family
   - Plan quarterly budget adjustments

4. **Teaching Kids**
   - Show kids their solo view regularly
   - Help them understand categories
   - Discuss spending decisions
   - Celebrate responsible spending

5. **Expense Quality**
   - Add descriptive transaction names
   - Use consistent formatting
   - Keep receipts for large purchases
   - Review transactions weekly

---

## 📱 Mobile Access

All views are fully responsive:
- **Mobile (< 480px):** Single-column layout, stacked cards
- **Tablet (480-768px):** Two-column layout, grouped cards
- **Desktop (> 768px):** Full three-column layout

### Mobile Tips:
- 💡 Use mobile view for quick budget checks
- 💡 Swipe to scroll long lists
- 💡 Tap category bars to select
- 💡 Full-screen display for uncluttered view

---

## 🔐 Security Notes

- Secure token-based authentication
- Session stored locally (logout clears data)
- Backend validates all role permissions
- Cannot access data outside your permissions
- All API calls require valid token

---

## 📞 Support

For issues or feature requests:
1. Check this guide first
2. Review error messages carefully
3. Take note of what you were doing when error occurred
4. Contact support with error details

---

**Last Updated:** Today

**Version:** 1.0

**Status:** ✅ Ready for Use
