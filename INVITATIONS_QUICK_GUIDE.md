# Invitations Feature - Quick Reference Guide

## What Was Implemented

A complete invitations management system for the solo-dashboard with the following capabilities:

✅ **Invitations Button** - Shows count of pending invitations on the Profile page
✅ **Invitations Modal** - Displays all pending family invitations
✅ **Accept Invitations** - Users can join a family by accepting an invitation
✅ **Decline Invitations** - Users can reject invitations they don't want
✅ **API Integration** - Backend endpoints to manage invitations
✅ **Error Handling** - Proper error messages and validation

---

## How It Works

### User Perspective:
1. User visits their Profile (solo-dashboard)
2. They see an "Invitations (X)" button if they have pending invitations
3. Click the button to open a modal showing all invitations
4. For each invitation, they can:
   - Accept it (joins the family)
   - Decline it (rejects the invitation)
5. After action, the modal updates and count decreases

### Visual Layout:
```
Profile Page
├── Avatar
├── Username
├── Family Info
├── Email
└── Buttons Section
    ├── Invitations (3)  ← NEW BUTTON (blue)
    ├── Change Data
    └── Finance tracker
```

---

## Files Modified/Created

### New Files:
- `front/src/components/InvitationsModal/InvitationsModal.jsx` - Modal component
- `front/src/components/InvitationsModal/InvitationsModal.css` - Modal styling
- `test_invitations_feature.py` - Test script
- `INVITATIONS_FEATURE_IMPLEMENTATION.md` - Detailed documentation

### Modified Files:
- `front/src/pages/Profile/Profile.jsx` - Added invitations button and modal integration
- `front/src/pages/Profile/Profile.css` - Added button styling
- `front/src/api/auth.js` - Added 3 new API functions
- `back/family_budget_app/views.py` - Added decline_invitation endpoint

---

## Backend API Endpoints

All endpoints require authentication (Token header).

### 1. GET `/api/users/invites/`
Fetch all pending invitations for the current user.
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  http://127.0.0.1:8000/api/users/invites/
```

### 2. POST `/api/users/accept_invitation/`
Accept a pending invitation.
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invitation_id": 1}' \
  http://127.0.0.1:8000/api/users/accept_invitation/
```

### 3. POST `/api/users/decline_invitation/`
Decline a pending invitation.
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invitation_id": 1}' \
  http://127.0.0.1:8000/api/users/decline_invitation/
```

---

## Frontend API Functions

Available in `front/src/api/auth.js`:

```javascript
// Fetch all pending invitations
const invitations = await fetchInvitationsApi();

// Accept an invitation
const result = await acceptInvitationApi(invitationId);

// Decline an invitation
const result = await declineInvitationApi(invitationId);
```

---

## Testing

To test the feature:

1. **Start the backend:**
   ```bash
   python manage.py runserver
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

3. **Login** with a user account

4. **Have another admin invite you** to a family

5. **Click "Invitations" button** on your profile

6. **Accept or Decline** the invitations

Alternatively, run the test script:
```bash
python test_invitations_feature.py
```
(Note: Update the TOKEN variable with a valid token first)

---

## Security Features

✓ Token-based authentication required
✓ Email validation (invitation must be for the user)
✓ Proper permission checks on backend
✓ CSRF protection
✓ Input validation

---

## UI Details

### Invitations Button:
- **Color**: Blue (#2196F3)
- **Hover Color**: Dark Blue (#1976D2)
- **Text Format**: "Invitations" or "Invitations (3)" if count > 0
- **Position**: First button in the buttons section on Profile page

### Modal Design:
- Dark overlay background
- Clean white modal window
- Header with close button (×)
- List of invitation cards
- Each card shows: Family name, Invited by, Date
- Green "Accept" and Red "Decline" buttons
- Status messages for success/error
- Responsive design (works on mobile)

---

## Notes

- The feature gracefully handles cases where there are no invitations
- The invitations count is fetched on page load
- The modal can be opened/closed at any time
- Once an invitation is accepted or declined, the user is redirected to their family
- Declined invitations are permanently deleted from the database
