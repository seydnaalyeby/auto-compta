from rest_framework import serializers
from .models import Operation, EcritureComptable

class EcritureComptableSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcritureComptable
        fields = '__all__'

class OperationSerializer(serializers.ModelSerializer):
    ecritures = EcritureComptableSerializer(many=True, read_only=True)

    class Meta:
        model = Operation
        fields = '__all__'
        read_only_fields = ['utilisateur', 'traitee_par_ia']

class SaisieTexteSerializer(serializers.Serializer):
    texte = serializers.CharField(required=True)
    date_operation = serializers.DateField(required=False)
