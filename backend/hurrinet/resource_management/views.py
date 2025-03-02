from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import InventoryItem, ResourceRequest, Distribution
from .serializers import InventoryItemSerializer, ResourceRequestSerializer, DistributionSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def inventory_list(request):
    if request.method == 'GET':
        inventory = InventoryItem.objects.all()
        serializer = InventoryItemSerializer(inventory, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = InventoryItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def resource_requests(request):
    print("Authorization Header:", request.META.get('HTTP_AUTHORIZATION'))
    print("Headers:", dict(request.headers))
    print("User:", request.user)
    print("Auth:", request.auth)
    print("Method:", request.method)
    
    if request.method == 'GET':
        requests = ResourceRequest.objects.all()
        serializer = ResourceRequestSerializer(requests, many=True)
        return Response(serializer.data)
    elif request.method == 'PUT':
        request_id = request.data.get('id')
        try:
            resource_request = ResourceRequest.objects.get(id=request_id)
            resource_request.status = request.data.get('status')
            resource_request.save()
            serializer = ResourceRequestSerializer(resource_request)
            return Response(serializer.data)
        except ResourceRequest.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def distribution_status(request):
    distribution = Distribution.objects.all()
    serializer = DistributionSerializer(distribution, many=True)
    return Response(serializer.data)
