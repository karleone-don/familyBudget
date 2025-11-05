from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Family, Role, Finance, Transaction, Category, Goal


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    # Allow providing role by its name during registration (e.g. "admin", "family_member", "kid")
    role_name = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        # keep `role` in fields for backward compatibility (accepts role id),
        # add `role_name` for easier API usage
        fields = ['user_id', 'username', 'email', 'password', 'password2', 'age', 'role', 'role_name']
        extra_kwargs = {
            'role': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Handle optional role_name provided as string. Default to 'solo' when not provided.
        role_name = validated_data.pop('role_name', None) or 'solo'
        # If role (id) was provided, remove it from kwargs because create_user doesn't accept it
        validated_data.pop('role', None)
        # Remove password2 before creating
        validated_data.pop('password2', None)

        user = User.objects.create_user(**validated_data)

        # Assign role if role_name provided (create if doesn't exist)
        if role_name:
            try:
                role_obj = Role.objects.get(role_name=role_name)
            except Role.DoesNotExist:
                role_obj = Role.objects.create(role_name=role_name)
            user.role = role_obj
            user.save()

        # Create finance profile for new user
        Finance.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError('Email and password are required')

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField(read_only=True)
    family_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'age', 'role', 'role_name', 'family', 'family_name']

    def get_role_name(self, obj):
        return obj.role.role_name if obj.role else None

    def get_family_name(self, obj):
        return obj.family.family_name if obj.family else None

class FamilySerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Family
        fields = ['family_id', 'family_name', 'admin', 'created_at', 'members']

class FinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finance
        fields = ['finance_id', 'balance', 'income', 'expenses', 'updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Goal
        fields = '__all__'