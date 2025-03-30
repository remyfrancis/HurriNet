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

    @action(detail=False, methods=["post"])
    def allocate(self, request):
        """Allocate inventory items to resources"""
        try:
            inventory_item_id = request.data.get("inventory_item_id")
            resource_id = request.data.get("resource_id")
            quantity = request.data.get("quantity")

            if not all([inventory_item_id, resource_id, quantity]):
                return Response(
                    {
                        "error": "inventory_item_id, resource_id, and quantity are required"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                inventory_item = InventoryItem.objects.get(id=inventory_item_id)
                resource = Resource.objects.get(id=resource_id)
            except (InventoryItem.DoesNotExist, Resource.DoesNotExist):
                return Response(
                    {"error": "Inventory item or resource not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Check if there's enough quantity available
            if inventory_item.quantity < quantity:
                return Response(
                    {"error": "Not enough quantity available"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update inventory item
            inventory_item.quantity -= quantity
            inventory_item.resource = resource
            inventory_item.save()

            return Response(
                {
                    "message": f"Successfully allocated {quantity} units to {resource.name}",
                    "inventory_item": InventoryItemSerializer(inventory_item).data,
                }
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def optimize_allocation(self, request):
        """Run Hungarian algorithm to optimize inventory allocation"""
        try:
            # Get data from the request body sent by Next.js
            items_data = request.data.get("items", [])
            resources_data = request.data.get("resources", [])
            suppliers_data = request.data.get("suppliers", [])

            # --- DEBUG LOGGING: Received data ---
            print(
                f"[optimize_allocation] Received Items Data ({len(items_data)}): {items_data}"
            )
            print(
                f"[optimize_allocation] Received Resources Data ({len(resources_data)}): {resources_data}"
            )
            print(
                f"[optimize_allocation] Received Suppliers Data ({len(suppliers_data)}): {suppliers_data}"
            )
            # --- END DEBUG LOGGING ---

            if not items_data or not resources_data:
                return Response(
                    {"error": "No unallocated inventory items or resources available"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Generate cost matrix based on distances and other factors
            cost_matrix = []
            valid_items_indices = []  # Keep track of items that have a supplier
            for i, item in enumerate(items_data):
                row = []
                supplier = next(
                    (s for s in suppliers_data if s["id"] == item["supplier_id"]), None
                )

                # Skip item if supplier is not found, preventing infinite cost
                if not supplier:
                    continue
                valid_items_indices.append(i)  # Record the index of the valid item

                for resource in resources_data:
                    # Calculate distance-based cost
                    distance = (
                        (supplier["location"]["lat"] - resource["location"]["lat"]) ** 2
                        + (supplier["location"]["lng"] - resource["location"]["lng"])
                        ** 2
                    ) ** 0.5

                    # Add capacity utilization penalty
                    capacity_ratio = (
                        resource["current_count"] / resource["capacity"]
                        if resource["capacity"] > 0
                        else 1
                    )
                    capacity_penalty = 50 if capacity_ratio > 0.8 else 0

                    # Add quantity availability penalty
                    quantity_penalty = 30 if item["quantity"] < 10 else 0

                    cost = distance + capacity_penalty + quantity_penalty
                    row.append(cost)
                cost_matrix.append(row)  # Only add rows for valid items

            if not cost_matrix:
                return Response(
                    {"error": "No valid items with suppliers found for allocation."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Apply Hungarian algorithm
            row_ind, col_ind = linear_sum_assignment(cost_matrix)

            # Generate allocation suggestions
            allocations = []
            allocated_item_ids = set()
            for i, j in zip(row_ind, col_ind):
                # Map back to original item index using valid_items_indices
                original_item_index = valid_items_indices[i]
                if original_item_index < len(items_data) and j < len(resources_data):
                    item = items_data[original_item_index]
                    resource = resources_data[j]
                    supplier = next(
                        (s for s in suppliers_data if s["id"] == item["supplier_id"]),
                        None,
                    )

                    # Ensure supplier exists (should always based on filter) and item not already allocated
                    if supplier and item["id"] not in allocated_item_ids:
                        # Calculate appropriate quantity to allocate (simple example: allocate all)
                        quantity_to_allocate = item["quantity"]

                        allocations.append(
                            {
                                "item_id": item["id"],  # Use ID for applying later
                                "resource_id": resource[
                                    "id"
                                ],  # Use ID for applying later
                                "from": supplier["name"],
                                "to": resource["name"],
                                "item": item["name"],
                                "quantity": quantity_to_allocate,
                            }
                        )
                        allocated_item_ids.add(item["id"])

            return Response({"success": True, "allocations": allocations})

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], url_path="apply_optimization")
    def apply_optimization(self, request):
        """Apply the suggested allocations from the optimization algorithm"""
        allocations = request.data.get("allocations", [])

        if not allocations:
            return Response(
                {"success": False, "error": "No allocations provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        applied_count = 0
        errors = []

        for allocation in allocations:
            try:
                item_id = allocation.get("item_id")
                resource_id = allocation.get("resource_id")

                if not item_id or not resource_id:
                    errors.append(
                        f"Missing item_id or resource_id in allocation: {allocation}"
                    )
                    continue

                # Find the item and resource
                item = InventoryItem.objects.get(id=item_id)
                resource = Resource.objects.get(id=resource_id)

                # Check if item is already allocated
                if item.resource is not None:
                    errors.append(
                        f"Item '{item.name}' (ID: {item_id}) is already allocated to {item.resource.name}."
                    )
                    continue

                # Apply the allocation
                item.resource = resource
                # Optionally: Adjust resource's current_count if needed
                # resource.current_count += item.quantity
                # resource.save()
                item.save()
                applied_count += 1

            except InventoryItem.DoesNotExist:
                errors.append(f"Inventory Item with ID {item_id} not found.")
            except Resource.DoesNotExist:
                errors.append(f"Resource with ID {resource_id} not found.")
            except Exception as e:
                errors.append(
                    f"Error applying allocation for item ID {item_id}: {str(e)}"
                )

        if errors:
            return Response(
                {
                    "success": False,
                    "message": f"Applied {applied_count} allocations with errors.",
                    "errors": errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": f"Successfully applied {applied_count} allocations.",
            }
        )


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
