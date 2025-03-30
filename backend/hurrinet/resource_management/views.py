from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
import numpy as np
from scipy.optimize import linear_sum_assignment
from .models import (
    Resource,
    InventoryItem,
    ResourceRequest,
    Distribution,
    Supplier,
    Transfer,
)
from .serializers import (
    ResourceSerializer,
    InventoryItemSerializer,
    ResourceRequestSerializer,
    DistributionSerializer,
    SupplierSerializer,
    StockLevelSerializer,
    LocationStockLevelSerializer,
    AggregatedStockLevelSerializer,
    TransferSerializer,
)


class ResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resources"""

    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Resource.objects.all()
        resource_type = self.request.query_params.get("resource_type", None)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        return queryset

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

    @action(detail=True, methods=["get"])
    def stock_levels(self, request, pk=None):
        """Get stock levels for a specific resource location"""
        resource = self.get_object()
        stock_levels = resource.get_stock_levels()
        serializer = LocationStockLevelSerializer(resource)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def all_stock_levels(self, request):
        """Get stock levels for all resource locations"""
        locations_stock = Resource.get_all_stock_levels()
        return Response(locations_stock)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing inventory items"""

    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def with_status(self, request):
        """Get inventory items with status information"""
        items = self.get_queryset()

        # Apply filters
        resource_type = request.query_params.get("resource_type")
        if resource_type:
            items = items.filter(resource__resource_type=resource_type)

        serializer = self.get_serializer(items, many=True)
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

        return Response(data)

    @action(detail=False, methods=["get"])
    def aggregated_stock_levels(self, request):
        """Get aggregated stock levels across all locations"""
        stock_levels = InventoryItem.get_aggregated_stock_levels()
        serializer = AggregatedStockLevelSerializer(stock_levels, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stock_status(self, request):
        """Get current stock status for all item types"""
        resource_id = request.query_params.get("resource_id")

        if resource_id:
            # Get stock levels for specific resource
            try:
                resource = Resource.objects.get(id=resource_id)
                stock_levels = resource.get_stock_levels()
                return Response(
                    {"resource_name": resource.name, "stock_levels": stock_levels}
                )
            except Resource.DoesNotExist:
                return Response(
                    {"error": "Resource not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Get aggregated stock levels
            stock_levels = InventoryItem.get_aggregated_stock_levels()
            return Response(stock_levels)


class ResourceRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resource requests"""

    queryset = ResourceRequest.objects.all()
    serializer_class = ResourceRequestSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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

    def get_queryset(self):
        queryset = Supplier.objects.all()
        supplier_type = self.request.query_params.get("supplier_type", None)
        if supplier_type:
            queryset = queryset.filter(supplier_type=supplier_type)
        return queryset

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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def allocate_procurement_resources(request):
    """
    Allocate procurement resources to destinations using the Hungarian Algorithm.
    """
    try:
        requests_data = request.data.get("requests", [])
        resources_data = request.data.get("resources", [])

        if not requests_data or not resources_data:
            return Response(
                {"error": "Both requests and resources are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create cost matrix
        cost_matrix = np.zeros((len(requests_data), len(resources_data)))

        for i, req in enumerate(requests_data):
            quantity = req["quantity"]
            priority = req.get("priority", 1)

            for j, res in enumerate(resources_data):
                # Convert location to Point
                res_location = Point(res["location"][1], res["location"][0])

                # Calculate cost based on:
                # 1. Resource capacity vs requested quantity
                # 2. Request priority
                capacity_ratio = min(res["capacity"] / quantity, 1.0)
                cost = (1.0 / capacity_ratio) * (1.0 / priority)
                cost_matrix[i][j] = cost

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
                        "resource_name": resources_data[j]["name"],
                        "cost": float(cost_matrix[i][j]),
                    }
                )

        # Update resource requests in database
        for assignment in assignments:
            request = ResourceRequest.objects.filter(
                id=assignment["request_id"]
            ).first()
            if request:
                request.status = "allocated"
                request.resource_id = assignment["resource_id"]
                request.save()

        return Response(assignments)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransferViewSet(viewsets.ModelViewSet):
    """ViewSet for managing inventory transfers"""

    queryset = Transfer.objects.all().order_by("-created_at")
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status", None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Complete a pending transfer"""
        transfer = self.get_object()

        try:
            transfer.complete_transfer()
            return Response(
                {"status": "success", "message": "Transfer completed successfully"}
            )
        except ValueError as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": "Failed to complete transfer"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a pending transfer"""
        transfer = self.get_object()

        if transfer.status != "pending":
            return Response(
                {
                    "status": "error",
                    "message": "Only pending transfers can be cancelled",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transfer.status = "cancelled"
        transfer.save()

        return Response(
            {"status": "success", "message": "Transfer cancelled successfully"}
        )
