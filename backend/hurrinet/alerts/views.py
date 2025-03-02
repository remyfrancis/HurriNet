from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Alert
from .serializers import AlertSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = Alert.objects.all()
        
        # Filter by active status
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
            
        # Filter by district
        district = self.request.query_params.get('district', None)
        if district:
            queryset = queryset.filter(district=district)
            
        return queryset

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
