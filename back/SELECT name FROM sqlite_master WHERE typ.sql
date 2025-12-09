SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

SELECT user_id, username, email, role_id, date_joined 
FROM family_budget_app_user 
ORDER BY user_id;

SELECT role_id, role_name 
FROM family_budget_app_role;

SELECT family_id, family_name, admin_id, join_code 
FROM family_budget_app_family;




SELECT 'Users' as item, COUNT(*) as count FROM family_budget_app_user
UNION ALL
SELECT 'Families', COUNT(*) FROM family_budget_app_family
UNION ALL
SELECT 'Roles', COUNT(*) FROM family_budget_app_role
UNION ALL
SELECT 'Tokens', COUNT(*) FROM authtoken_token
UNION ALL
SELECT 'Finance', COUNT(*) FROM family_budget_app_finance;
