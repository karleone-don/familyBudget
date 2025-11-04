from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Family, Role, Finance, Transaction, Category, Goal
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'password', 'password2', 'age', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
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