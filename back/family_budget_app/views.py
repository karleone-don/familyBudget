from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import User, Family, Finance, Transaction, Goal, Role, Category, Invitation
from .serializers import *
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404


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

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        family = serializer.save(admin=self.request.user)
        self.request.user.family = family
        admin_role, _ = Role.objects.get_or_create(role_name='admin')
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

        member_role, _ = Role.objects.get_or_create(role_name='family_member')
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

        member_role, _ = Role.objects.get_or_create(role_name='family_member')
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

        # allow creating new roles on demand
        role, _ = Role.objects.get_or_create(role_name=role_name)

        user.role = role
        user.save()
        return Response({'message': f'User role updated to {role.role_name}'})

    @action(detail=False, methods=['post'])
    def join(self, request):
        family_id = request.data.get('family_id')
        try:
            family = Family.objects.get(family_id=family_id)
            request.user.family = family
            member_role, _ = Role.objects.get_or_create(role_name='family_member')
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
            kid_role, _ = Role.objects.get_or_create(role_name='kid')
            member_role, _ = Role.objects.get_or_create(role_name='family_member')

            user.role = kid_role if is_kid else member_role
            user.save()

            return Response({'message': 'User role updated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

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

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]