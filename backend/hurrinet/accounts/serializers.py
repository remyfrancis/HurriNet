from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'phone_number', 
                 'location', 'organization', 'verified')
        read_only_fields = ('verified',)

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'user_type',
            'phone_number',
            'location',
            'organization'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True},
            'first_name': {'required': True},
            'user_type': {'required': True},
            'location': {'required': True},
        }

    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                user_type=validated_data.get('user_type', 'public'),
                location=validated_data.get('location', ''),
                phone_number=validated_data.get('phone_number', ''),
                organization=validated_data.get('organization', '')
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")