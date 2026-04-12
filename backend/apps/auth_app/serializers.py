from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class InscriptionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2',
                  'nom_entreprise', 'secteur', 'telephone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UtilisateurSerializer(serializers.ModelSerializer):
    date_creation = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nom_entreprise',
                  'secteur', 'telephone', 'adresse', 'date_creation']
