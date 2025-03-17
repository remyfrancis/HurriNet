from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
import numpy as np
from scipy.optimize import linear_sum_assignment
from .models import Resource, InventoryItem, ResourceRequest, Distribution, Supplier
from .serializers import (
    ResourceSerializer,
    InventoryItemSerializer,
    ResourceRequestSerializer,
    DistributionSerializer,
    SupplierSerializer,
)


class ResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resources"""

    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def allocate_resources(self, request):
        """
        Allocate resources to requests using the Hungarian Algorithm
        Request format:
        {
            "requests": [{"id": 1, "location": [lat, lon], "priority": 1}, ...],
            "resources": [{"id": 1, "location": [lat, lon], "capacity": 10}, ...]
        }
        """
        requests_data = request.data.get("requests", [])
        resources_data = request.data.get("resources", [])

        if not requests_data or not resources_data:
            return Response(
                {"error": "Both requests and resources are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create cost matrix based on distance and priority
        cost_matrix = np.zeros((len(requests_data), len(resources_data)))

        for i, req in enumerate(requests_data):
            req_location = Point(req["location"][1], req["location"][0])
            req_priority = req.get("priority", 1)

            for j, res in enumerate(resources_data):
                res_location = Point(res["location"][1], res["location"][0])
                distance = req_location.distance(res_location)
                capacity = res.get("capacity", 1)

                # Cost function: distance * priority / capacity
                cost_matrix[i][j] = (distance * req_priority) / capacity

        # Apply Hungarian Algorithm
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        # Create assignments
        assignments = []
        for i, j in zip(row_ind, col_ind):
            if i < len(requests_data) and j < len(resources_data):
                assignments.append(
                    {
                        "request_id": requests_data[i]["id"],
                        "resource_id": resources_data[j]["id"],
                        "cost": cost_matrix[i][j],
                    }
                )

        # Update resource assignments in database
        for assignment in assignments:
            resource = Resource.objects.get(id=assignment["resource_id"])
            request = ResourceRequest.objects.get(id=assignment["request_id"])

            resource.assigned_request = request
            resource.last_assignment_cost = assignment["cost"]
            resource.save()

            request.status = "assigned"
            request.save()

        return Response(assignments)

    @action(detail=True, methods=["get"])
    def nearby_requests(self, request, pk=None):
        """Get nearby resource requests within coverage area"""
        resource = self.get_object()
        requests = (
            ResourceRequest.objects.filter(
                location__within=resource.coverage_area, status="pending"
            )
            .annotate(distance=Distance("location", resource.location))
            .order_by("distance")
        )

        serializer = ResourceRequestSerializer(requests, many=True)
        return Response(serializer.data)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing inventory items"""

    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def with_status(self, request):
        """Get inventory items with status information"""
        items = InventoryItem.objects.all()

        # Apply filters if provided
        resource_type = request.query_params.get("resource_type")
        if resource_type:
            items = items.filter(resource__resource_type=resource_type)

        # Filter by location if provided
        location = request.query_params.get("location")
        if location:
            # Get the resource IDs that match the location name
            resource_ids = Resource.objects.filter(
                name__icontains=location
            ).values_list("id", flat=True)
            if resource_ids:
                items = items.filter(resource__in=resource_ids)

        status_filter = request.query_params.get("status")

        # Serialize the data
        serializer = InventoryItemSerializer(items, many=True)
        data = serializer.data

        # Add status information
        for item in data:
            quantity = item["quantity"]
            capacity = item["capacity"]
            ratio = quantity / capacity if capacity > 0 else 0

            if ratio >= 0.7:
                item["status"] = "Sufficient"
            elif ratio >= 0.4:
                item["status"] = "Moderate"
            else:
                item["status"] = "Low"

            item["last_updated"] = (
                item["updated_at"].split("T")[0] if "updated_at" in item else None
            )

        # Filter by status if requested
        if status_filter and status_filter.lower() != "all":
            data = [
                item for item in data if item["status"].lower() == status_filter.lower()
            ]

        return Response(data)


class ResourceRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resource requests"""

    queryset = ResourceRequest.objects.all()
    serializer_class = ResourceRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class DistributionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing distributions"""

    queryset = Distribution.objects.all()
    serializer_class = DistributionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def update_completion(self, request, pk=None):
        """Update the completion status of a distribution"""
        distribution = self.get_object()
        fulfilled = request.data.get("fulfilled_requests")

        if fulfilled is not None:
            distribution.fulfilled_requests = fulfilled
            distribution.save()

            serializer = self.get_serializer(distribution)
            return Response(serializer.data)

        return Response(
            {"error": "fulfilled_requests is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing suppliers"""

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        """Get suppliers filtered by type"""
        supplier_type = request.query_params.get("type")
        if supplier_type:
            suppliers = Supplier.objects.filter(supplier_type=supplier_type)
        else:
            suppliers = Supplier.objects.all()

        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def items(self, request, pk=None):
        """Get items supplied by this supplier"""
        supplier = self.get_object()
        items = supplier.supplied_items.all()

        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)


# Add a simple test endpoint to verify the API is working
@api_view(["GET"])
@permission_classes([AllowAny])
def api_test(request):
    """Simple test endpoint to verify the API is working"""
    return Response({"status": "ok", "message": "API is working correctly"})
