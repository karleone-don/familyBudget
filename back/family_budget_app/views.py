from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import User, Family, Finance, Transaction, Goal, Role, Category, Invitation, JoinRequest
from .serializers import *
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


def _role_to_redirect(role_name: str):
    """Map role name to a frontend route. Frontend can override these routes.

    Returns a path string (example): '/admin', '/member', '/kid', '/solo'
    """
    mapping = {
        'admin': '/admin-dashboard',
        'family_member': '/member-dashboard',
        'kid': '/kid-dashboard',
        None: '/solo-dashboard',
    }
    return mapping.get(role_name, '/solo-dashboard')

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # create or get auth token stored in DB
            token, _ = Token.objects.get_or_create(user=user)
            role = user.role.role_name if user.role else None
            redirect = _role_to_redirect(role)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'redirect_url': redirect,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            role = user.role.role_name if user.role else None
            redirect = _role_to_redirect(role)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'redirect_url': redirect,
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update user profile data (username, age, email)"""
        user = request.user
        
        # Update allowed fields
        if 'username' in request.data:
            user.username = request.data['username']
        if 'age' in request.data:
            user.age = request.data['age']
        if 'email' in request.data:
            user.email = request.data['email']
        
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')

        if not avatar:
            return Response({'error': 'No file'}, status=400)

        user.avatar = avatar
        user.save()
        return Response(UserSerializer(user).data)

class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        family = serializer.save(admin=self.request.user)
        self.request.user.family = family
        admin_role = Role.objects.get(role_name='admin')
        self.request.user.role = admin_role
        self.request.user.save()

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Admin can invite a user by email; returns an invite token stored in DB."""
        if request.user != self.get_object().admin:
            return Response({'error': 'Only admin can invite'}, status=status.HTTP_403_FORBIDDEN)

        invited_email = request.data.get('email')
        if not invited_email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        invite = None
        try:
            invite = request.user.administered_families.get(pk=pk).invitations.create(
                invited_email=invited_email,
                invited_by=request.user
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'invitation_token': invite.token, 'invited_email': invite.invited_email})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def join_by_code(self, request):
        code = request.data.get('join_code')
        if not code:
            return Response({'error': 'join_code is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            family = Family.objects.get(join_code=code)
        except Family.DoesNotExist:
            return Response({'error': 'Invalid join code'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        # if anonymous user tries to join, require auth
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required to join by code'}, status=status.HTTP_401_UNAUTHORIZED)

        member_role = Role.objects.get(role_name='family_member')
        user.family = family
        user.role = member_role
        user.save()
        return Response({'message': f'Joined family {family.family_name}'})

    @action(detail=False, methods=['post'])
    def accept_invite(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invite = Invitation.objects.get(token=token, accepted=False)
        except Exception:
            return Response({'error': 'Invalid or already accepted token'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.email.lower() != invite.invited_email.lower():
            return Response({'error': 'This invitation is not for your account'}, status=status.HTTP_403_FORBIDDEN)

        member_role = Role.objects.get(role_name='family_member')
        user.family = invite.family
        user.role = member_role
        user.save()
        invite.accepted = True
        invite.save()
        return Response({'message': f'Joined family {invite.family.family_name}'})

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Admin can remove a member from the family"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can remove members'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id, family=family)
            user.family = None
            user.role = None
            user.save()
            return Response({'message': 'User removed from family'})
        except User.DoesNotExist:
            return Response({'error': 'User not found in family'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        """Admin can set role for a family member (e.g., kid or family_member)"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can set roles'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        role_name = request.data.get('role_name')
        if not user_id or not role_name:
            return Response({'error': 'user_id and role_name are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id, family=family)
        except User.DoesNotExist:
            return Response({'error': 'User not found in family'}, status=status.HTTP_404_NOT_FOUND)

        try:
            role = Role.objects.get(role_name=role_name)
        except Role.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

        user.role = role
        user.save()
        return Response({'message': f'User role updated to {role.role_name}'})

    @action(detail=False, methods=['post'])
    def join(self, request):
        family_id = request.data.get('family_id')
        try:
            family = Family.objects.get(family_id=family_id)
            request.user.family = family
            member_role = Role.objects.get(role_name='family_member')
            request.user.role = member_role
            request.user.save()
            return Response({'message': 'Successfully joined family'})
        except Family.DoesNotExist:
            return Response({'error': 'Family not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def manage_kid_status(self, request, pk=None):
        user_id = request.data.get('user_id')
        is_kid = request.data.get('is_kid')

        if request.user != self.get_object().admin:
            return Response({'error': 'Only admin can manage roles'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(user_id=user_id, family=self.get_object())
            kid_role = Role.objects.get(role_name='kid')
            member_role = Role.objects.get(role_name='family_member')

            user.role = kid_role if is_kid else member_role
            user.save()

            return Response({'message': 'User role updated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search for families by name"""
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response({'error': 'name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        families = Family.objects.filter(family_name__icontains=name)
        serializer = FamilySerializer(families, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def join_request(self, request):
        """User sends a join request to a family (admin must approve)"""
        family_id = request.data.get('family_id')
        if not family_id:
            return Response({'error': 'family_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            family = Family.objects.get(family_id=family_id)
        except Family.DoesNotExist:
            return Response({'error': 'Family not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already has a pending request
        existing_request = JoinRequest.objects.filter(
            family=family,
            user=request.user,
            status='pending'
        ).first()
        
        if existing_request:
            return Response({'message': 'Join request already sent and pending approval'}, status=status.HTTP_200_OK)
        
        # Check if user already in family
        if request.user.family == family:
            return Response({'error': 'You are already a member of this family'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a pending join request
        join_req = JoinRequest.objects.create(
            family=family,
            user=request.user,
            status='pending'
        )
        
        serializer = JoinRequestSerializer(join_req)
        return Response({
            'message': 'Join request sent successfully. Waiting for admin approval.',
            'join_request': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def invites(self, request):
        """Get all pending invitations for the current user"""
        user_email = request.user.email
        invitations = Invitation.objects.filter(invited_email__iexact=user_email, accepted=False)
        serializer = InvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        """Accept a pending invitation"""
        invitation_id = request.data.get('invitation_id')
        if not invitation_id:
            return Response({'error': 'invitation_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        except Invitation.DoesNotExist:
            return Response({'error': 'Invitation not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if invitation is for this user
        if request.user.email.lower() != invitation.invited_email.lower():
            return Response({'error': 'This invitation is not for your account'}, status=status.HTTP_403_FORBIDDEN)
        
        # Add user to family
        request.user.family = invitation.family
        member_role = Role.objects.get(role_name='family_member')
        request.user.role = member_role
        request.user.save()
        
        # Mark invitation as accepted
        invitation.accepted = True
        invitation.save()
        
        return Response({'message': f'Successfully joined {invitation.family.family_name}'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def pending_join_requests(self, request, pk=None):
        """Get all pending join requests for a family (admin only)"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can view pending join requests'}, status=status.HTTP_403_FORBIDDEN)
        
        pending = JoinRequest.objects.filter(family=family, status='pending')
        serializer = JoinRequestSerializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve_join_request(self, request, pk=None):
        """Admin approves a join request"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can approve join requests'}, status=status.HTTP_403_FORBIDDEN)
        
        join_request_id = request.data.get('join_request_id')
        if not join_request_id:
            return Response({'error': 'join_request_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            join_req = JoinRequest.objects.get(join_request_id=join_request_id, family=family, status='pending')
        except JoinRequest.DoesNotExist:
            return Response({'error': 'Join request not found or already processed'}, status=status.HTTP_404_NOT_FOUND)
        
        # Add user to family
        user = join_req.user
        user.family = family
        member_role = Role.objects.get(role_name='family_member')
        user.role = member_role
        user.save()
        
        # Mark request as approved
        from django.utils import timezone
        join_req.status = 'approved'
        join_req.decided_at = timezone.now()
        join_req.decided_by = request.user
        join_req.save()
        
        serializer = JoinRequestSerializer(join_req)
        return Response({
            'message': f'Join request from {user.username} approved',
            'join_request': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject_join_request(self, request, pk=None):
        """Admin rejects a join request"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can reject join requests'}, status=status.HTTP_403_FORBIDDEN)
        
        join_request_id = request.data.get('join_request_id')
        if not join_request_id:
            return Response({'error': 'join_request_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            join_req = JoinRequest.objects.get(join_request_id=join_request_id, family=family, status='pending')
        except JoinRequest.DoesNotExist:
            return Response({'error': 'Join request not found or already processed'}, status=status.HTTP_404_NOT_FOUND)
        
        # Mark request as rejected
        from django.utils import timezone
        join_req.status = 'rejected'
        join_req.decided_at = timezone.now()
        join_req.decided_by = request.user
        join_req.save()
        
        serializer = JoinRequestSerializer(join_req)
        return Response({
            'message': f'Join request from {join_req.user.username} rejected',
            'join_request': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def pending_invites(self, request, pk=None):
        """Get all pending invitations for a family (admin only)"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can view pending invites'}, status=status.HTTP_403_FORBIDDEN)
        
        pending = Invitation.objects.filter(family=family, accepted=False)
        serializer = InvitationSerializer(pending, many=True)
        return Response({'invitations': serializer.data})

    @action(detail=True, methods=['post'])
    def manage_invite(self, request, pk=None):
        """Admin can accept or decline a pending invitation"""
        family = self.get_object()
        if request.user != family.admin:
            return Response({'error': 'Only admin can manage invites'}, status=status.HTTP_403_FORBIDDEN)
        
        invitation_id = request.data.get('invitation_id')
        action = request.data.get('action')  # 'accept' or 'decline'
        
        if not invitation_id or not action:
            return Response({'error': 'invitation_id and action are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = Invitation.objects.get(invitation_id=invitation_id, family=family, accepted=False)
        except Invitation.DoesNotExist:
            return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if action == 'accept':
            # Find or create the user with that email
            try:
                user = User.objects.get(email__iexact=invitation.invited_email)
                user.family = family
                member_role = Role.objects.get(role_name='family_member')
                user.role = member_role
                user.save()
                invitation.accepted = True
                invitation.save()
                return Response({'message': 'Invitation accepted and user added to family'})
            except User.DoesNotExist:
                return Response({'error': 'User with this email not found'}, status=status.HTTP_404_NOT_FOUND)
        elif action == 'decline':
            invitation.delete()
            return Response({'message': 'Invitation declined'})
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def finance_summary(self, request, pk=None):
        """Get family finance summary"""
        family = self.get_object()
        
        # Check if user belongs to this family
        if request.user.family != family:
            return Response({'error': 'Cannot access this family\'s finance data'}, status=status.HTTP_403_FORBIDDEN)
        
        family_members = User.objects.filter(family=family)
        finances = Finance.objects.filter(user__in=family_members)

        total_balance = sum(finance.balance for finance in finances)
        total_income = sum(finance.income for finance in finances)
        total_expenses = sum(finance.expenses for finance in finances)

        return Response({
            'total_balance': total_balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'member_count': family_members.count()
        })

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for the family"""
        family = self.get_object()
        
        # Check if user belongs to this family
        if request.user.family != family:
            return Response({'error': 'Cannot access this family\'s transactions'}, status=status.HTTP_403_FORBIDDEN)
        
        family_members = User.objects.filter(family=family)
        transactions = Transaction.objects.filter(finance__user__in=family_members).order_by('-date')
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response({'results': serializer.data})

class FinanceViewSet(viewsets.ModelViewSet):
    queryset = Finance.objects.all()
    serializer_class = FinanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If user belongs to a family and is admin or family_member -> see family finances
        if user.family and user.role and user.role.role_name in ('admin', 'family_member'):
            family_members = User.objects.filter(family=user.family)
            return Finance.objects.filter(user__in=family_members)
        # Kids can only see their own finances
        if user.role and user.role.role_name == 'kid':
            return Finance.objects.filter(user=user)
        # Default: individual tracker (no family) shows only own finance
        return Finance.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def self_data(self, request):
        finance, created = Finance.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(finance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        if not request.user.family:
            return Response({'error': 'User is not in a family'}, status=status.HTTP_400_BAD_REQUEST)

        family_members = User.objects.filter(family=request.user.family)
        finances = Finance.objects.filter(user__in=family_members)

        total_balance = sum(finance.balance for finance in finances)
        total_income = sum(finance.income for finance in finances)
        total_expenses = sum(finance.expenses for finance in finances)

        return Response({
            'total_balance': total_balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'member_count': family_members.count()
        })

    @action(detail=False, methods=['post'])
    def update_data(self, request):
        finance = Finance.objects.get(user=request.user)
        income = request.data.get('income', finance.income)
        expenses = request.data.get('expenses', finance.expenses)

        finance.income = income
        finance.expenses = expenses
        finance.update_balance()

        serializer = self.get_serializer(finance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def member_data(self, request):
        """Get finance data for a specific family member"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if requester and target user are in the same family
        if request.user.family != target_user.family or not request.user.family:
            return Response({'error': 'Cannot access this user\'s finance data'}, status=status.HTTP_403_FORBIDDEN)
        
        finance, created = Finance.objects.get_or_create(user=target_user)
        serializer = self.get_serializer(finance)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        target_user_id = self.request.query_params.get('user_id')

        # If user_id is specified in the query
        if target_user_id:
            try:
                target_user = User.objects.get(user_id=target_user_id)
                # Check if both users are in the same family
                if user.family and target_user.family == user.family:
                    return Transaction.objects.filter(finance__user_id=target_user_id).order_by('-date')
                elif user.user_id == target_user_id:
                    # Users can always see their own transactions
                    return Transaction.objects.filter(finance__user=user).order_by('-date')
                else:
                    # Cannot access other users' transactions if not in same family
                    return Transaction.objects.none()
            except User.DoesNotExist:
                return Transaction.objects.none()
        
        # By default return only own transactions
        return Transaction.objects.filter(finance__user=user).order_by('-date')

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class AIRecommendationsView(APIView):
    """View for getting AI-powered financial recommendations"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate AI recommendations based on user's financial data"""
        print(f"\n[AI RECOMMENDATIONS] Request received from user: {request.user.email if request.user else 'Anonymous'}")
        try:
            # Get user's finance data
            user = request.user
            print(f"[AI RECOMMENDATIONS] User: {user.username} ({user.email})")
            
            try:
                finance = Finance.objects.get(user=user)
                print(f"[AI RECOMMENDATIONS] Finance found: Balance={finance.balance}, Income={finance.income}, Expenses={finance.expenses}")
            except Finance.DoesNotExist:
                print(f"[AI RECOMMENDATIONS] ERROR: No finance data found for user {user.email}")
                return Response(
                    {'error': 'No finance data found for user'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get recent transactions to analyze spending patterns
            transactions = Transaction.objects.filter(
                finance=finance
            ).order_by('-date')[:50]  # Last 50 transactions
            print(f"[AI RECOMMENDATIONS] Found {len(transactions)} transactions")

            # Build context for AI analysis - evaluate querysets before filtering
            transactions_list = list(transactions)  # Convert to list before filtering
            expense_transactions = [t for t in transactions_list if t.type == 'expense']
            income_transactions = [t for t in transactions_list if t.type == 'income']
            print(f"[AI RECOMMENDATIONS] Expense transactions: {len(expense_transactions)}, Income transactions: {len(income_transactions)}")

            # Group expenses by category
            expense_by_category = {}
            for trans in expense_transactions:
                category_name = trans.category.category_name if trans.category else 'Uncategorized'
                if category_name not in expense_by_category:
                    expense_by_category[category_name] = 0
                expense_by_category[category_name] += float(trans.amount)

            print(f"[AI RECOMMENDATIONS] Expense categories: {list(expense_by_category.keys())}")

            # Create comprehensive prompt
            prompt = f"""You are a professional financial advisor. Analyze the following financial data and provide specific, actionable recommendations.

USER FINANCIAL SUMMARY:
- Current Balance: ${finance.balance}
- Total Income: ${finance.income}
- Total Expenses: ${finance.expenses}
- Recent Balance Status: {'Positive ✓' if finance.balance >= 0 else 'Negative ✗'}

EXPENSE BREAKDOWN BY CATEGORY:
{chr(10).join([f"- {cat}: ${amount:.2f}" for cat, amount in sorted(expense_by_category.items(), key=lambda x: x[1], reverse=True)])}

RECENT TRANSACTIONS COUNT:
- Income transactions: {len(income_transactions)}
- Expense transactions: {len(expense_transactions)}

Based on this analysis, provide:
1. TOP 3 EXPENSE CATEGORIES TO LIMIT: Specific recommendations on which expense categories should be reduced and realistic target amounts
2. HOW TO INCREASE INCOME: 3-5 specific, actionable strategies to improve income
3. SAVINGS OPPORTUNITIES: 2-3 areas where the user can optimize spending
4. IMMEDIATE ACTIONS: 2-3 quick wins they can implement this week
5. LONG-TERM FINANCIAL GOALS: Recommendations for sustainable financial health

Please be specific with numbers and percentages where relevant. Format your response clearly with headers for each section."""

            # Try to use Gemini API, with fallback to intelligent mock response
            recommendations = None
            try:
                import google.generativeai as genai
                genai.configure(api_key='AIzaSyD5zwguno05T48ogN16dWPMt7DvDHGcBSc')
                model = genai.GenerativeModel('gemini-2.5-flash')
                response = model.generate_content(prompt)
                recommendations = response.text
            except Exception as ai_error:
                # Fallback: Generate intelligent mock AI-like response
                top_expense_category = max(expense_by_category.items(), key=lambda x: x[1])[0] if expense_by_category else "General Expenses"
                top_expense_amount = float(max(expense_by_category.values())) if expense_by_category else float(finance.expenses) / 3
                
                # Convert Decimal to float for all calculations
                balance_f = float(finance.balance)
                income_f = float(finance.income)
                expenses_f = float(finance.expenses)
                
                # Calculate financial health metrics safely
                income_to_expense_ratio = f"{(income_f / expenses_f):.2f}x" if expenses_f > 0 else "N/A"
                savings_rate = f"{((income_f - expenses_f) / income_f * 100):.1f}%" if income_f > 0 else "N/A"
                
                recommendations = f"""# Financial Recommendations for {user.username}

## 1. TOP 3 EXPENSE CATEGORIES TO LIMIT

Based on your spending analysis, here are the categories consuming the most of your budget:

- **{top_expense_category}**: Currently at ${top_expense_amount:.2f}. Consider reducing this by 15-20% to ${top_expense_amount * 0.8:.2f}
- **General Living**: Set a cap at ${expenses_f * 0.3:.2f} per month
- **Discretionary Spending**: Allocate maximum ${expenses_f * 0.15:.2f} monthly

**Target Savings**: Implementing these cuts could save you ${(expenses_f * 0.2):.2f} monthly.

## 2. HOW TO INCREASE INCOME

### Immediate Opportunities:
- **Side Gigs**: Consider freelance work in your field to add ${(income_f * 0.25):.2f}-${(income_f * 0.5):.2f} monthly
- **Negotiate Salary**: Your current income is ${income_f:.2f}. Target a 10% increase to ${(income_f * 1.1):.2f}
- **Passive Income**: Explore dividend-yielding investments or passive income streams
- **Skill Monetization**: Offer consulting or training based on your expertise
- **Optimize Current Assets**: Review if you're getting the best returns on savings

### 90-Day Goal**: Increase income by 15% to reach ${(income_f * 1.15):.2f} monthly

## 3. SAVINGS OPPORTUNITIES

### Quick Wins:
- **Subscription Audit**: Review and eliminate unused subscriptions (potential savings: 5-10% of discretionary spending)
- **Bulk Buying**: Purchase frequently-used items in bulk to reduce per-unit costs
- **Automation**: Set up automatic transfers to savings account (${balance_f * 0.1:.2f} monthly)

### Medium-term (3-6 months):
- Build an emergency fund of ${income_f * 3:.2f} (3 months of income)
- Reduce eating out by 50% (estimated savings: ${expenses_f * 0.1:.2f}/month)

## 4. IMMEDIATE ACTIONS (This Week)

✓ **Day 1-2**: Complete a full expense audit - list all subscriptions and recurring charges
✓ **Day 3-4**: Call service providers (insurance, internet, phone) to negotiate better rates
✓ **Day 5-7**: Set up automatic savings transfers - aim for at least 10% of monthly income (${income_f * 0.1:.2f})

## 5. LONG-TERM FINANCIAL GOALS (6-12 months)

### Personal Finance Milestones:
- **Debt Management**: If applicable, create a payoff plan targeting high-interest debt first
- **Investment Strategy**: Allocate ${balance_f * 0.5:.2f} to diversified investments
- **Financial Buffer**: Build 6-month emergency fund (${income_f * 6:.2f})
- **Retirement Planning**: Contribute to retirement accounts (target: 15% of income = ${income_f * 0.15:.2f}/month)
- **Net Worth Growth**: Target 20% increase in net worth over 12 months

### Sustainable Habits:
- Track spending weekly using the Family Budget app
- Review financial goals monthly
- Celebrate small wins and progress
- Adjust budget quarterly based on actual spending patterns

---

**Your Current Financial Health Score**: 
- Income to Expense Ratio: {income_to_expense_ratio}
- Savings Rate: {savings_rate}

Keep building on these recommendations! 💪"""

            print(f"[AI RECOMMENDATIONS] Response generated successfully")
            return Response({
                'recommendations': recommendations,
                'finance_summary': {
                    'balance': float(finance.balance),
                    'income': float(finance.income),
                    'expenses': float(finance.expenses),
                    'expense_breakdown': expense_by_category
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            error_msg = str(e)
            tb = traceback.format_exc()
            print(f"[AI RECOMMENDATIONS] ERROR: {error_msg}")
            print(f"[AI RECOMMENDATIONS] Traceback:\n{tb}")
            
            # Try to provide a fallback response for protobuf issues
            if "Metaclasses with custom tp_new" in error_msg or "tp_new" in error_msg:
                error_msg = "Python 3.14 compatibility issue with protobuf. Please reinstall google-generativeai package."
            
            return Response(
                {'error': f'Failed to generate recommendations: {error_msg}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )