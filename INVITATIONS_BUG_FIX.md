# Invitations Button - Bug Fix Summary

## Issue
The invitations button on the profile page (solo-dashboard) was giving an error instead of displaying the list of invitations from family admins.

## Root Cause
The backend `accept_invitation` and `decline_invitation` endpoints in the `UserViewSet` were using the wrong field name to query the Invitation model:
- **Wrong:** `Invitation.objects.get(id=invitation_id, ...)`  
- **Correct:** `Invitation.objects.get(invitation_id=invitation_id, ...)`

The Invitation model uses `invitation_id` as its primary key (not `id`), so the queries were failing with a FieldError.

## Fixes Applied

### 1. Backend (views.py)
Fixed the two endpoints in the `UserViewSet` class:

**accept_invitation()** - Line 117
- Changed: `invitation = Invitation.objects.get(id=invitation_id, accepted=False)`
- To: `invitation = Invitation.objects.get(invitation_id=invitation_id, accepted=False)`

**decline_invitation()** - Line 145  
- Changed: `invitation = Invitation.objects.get(id=invitation_id, accepted=False)`
- To: `invitation = Invitation.objects.get(invitation_id=invitation_id, accepted=False)`

### 2. Backend (serializers.py)
Updated the `InvitationSerializer` to improve data returned:
- Removed the ambiguous `id` field from the serializer
- Added `invited_by_name` field to return the username of who sent the invitation
- Kept `invitation_id` as the primary identifier

### 3. Frontend (InvitationsModal.jsx)
Updated the component to use the new serializer field:
- Changed: `invitation.invited_by`
- To: `invitation.invited_by_name`

### 4. API URLs (ai.js, auth.js)
Ensured consistency across all API calls:
- Changed default API_URL from `http://localhost:8000` to `http://127.0.0.1:8000`
- This prevents CORS issues and authentication header problems

## Verification
All endpoints now work correctly:

✅ GET `/api/users/invites/` - Returns pending invitations  
✅ POST `/api/users/accept_invitation/` - User accepts and joins family  
✅ POST `/api/users/decline_invitation/` - User declines invitation  

## Expected Behavior After Fix
1. User opens their profile (solo-dashboard)
2. Clicks the "Invitations (count)" button
3. Modal opens showing all pending invitations from family admins
4. Each invitation displays:
   - Family name
   - Who invited them (username)
   - When the invitation was sent
5. User can accept or decline each invitation
6. Modal updates immediately after action

## Test Results
All API endpoints tested successfully with a test script:
- Invitations are fetched correctly
- Accept invitation works and adds user to family
- Decline invitation works and removes the invitation
