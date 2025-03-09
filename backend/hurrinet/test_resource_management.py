import os
import django
import json
from django.contrib.gis.geos import Point
from django.contrib.auth import get_user_model

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

from resource_management.models import Resource, ResourceRequest
from resource_management.views import ResourceViewSet


def create_test_data():
    # Create test user
    User = get_user_model()
    user, created = User.objects.get_or_create(
        email="test@example.com", defaults={"password": "testpass123"}
    )

    # Create test resources
    resources = [
        {
            "name": "Emergency Medical Unit 1",
            "resource_type": "MEDICAL",
            "description": "Mobile medical unit with basic supplies",
            "status": "AVAILABLE",
            "capacity": 50,
            "current_count": 50,
            "current_workload": 0,
            "location": Point(-60.9789, 13.9094),  # Saint Lucia coordinates
            "address": "Saint Lucia General Hospital",
        },
        {
            "name": "Water Supply Station 1",
            "resource_type": "WATER",
            "description": "Portable water supply station",
            "status": "AVAILABLE",
            "capacity": 100,
            "current_count": 100,
            "current_workload": 0,
            "location": Point(-60.9956, 13.9094),  # Different location
            "address": "Castries Water Treatment Plant",
        },
    ]

    created_resources = []
    for resource_data in resources:
        resource, created = Resource.objects.get_or_create(
            name=resource_data["name"], defaults=resource_data
        )
        created_resources.append(resource)
        print(f"Created resource: {resource.name}")

    # Create test requests
    requests = [
        {
            "resource": created_resources[0],
            "quantity": 10,
            "location": Point(-60.9889, 13.9194),  # Nearby location
            "priority": 2,
            "requester": user,
        },
        {
            "resource": created_resources[1],
            "quantity": 20,
            "location": Point(-60.9856, 13.9094),  # Different nearby location
            "priority": 1,
            "requester": user,
        },
    ]

    for request_data in requests:
        request = ResourceRequest.objects.create(**request_data)
        print(f"Created request for {request.resource.name}")

    return created_resources, requests


def test_allocation():
    # Get all resources and requests
    resources = Resource.objects.all()
    requests = ResourceRequest.objects.filter(status="pending")

    # Prepare data for allocation
    allocation_data = {
        "resources": [
            {
                "id": resource.id,
                "location": [resource.location.x, resource.location.y],
                "capacity": resource.capacity,
            }
            for resource in resources
        ],
        "requests": [
            {
                "id": request.id,
                "location": [request.location.x, request.location.y],
                "priority": request.priority,
            }
            for request in requests
        ],
    }

    # Create a ResourceViewSet instance
    viewset = ResourceViewSet()

    # Test allocation
    print("\nTesting resource allocation...")
    print("Input data:", json.dumps(allocation_data, indent=2))

    class MockRequest:
        def __init__(self, data):
            self.data = data

    mock_request = MockRequest(allocation_data)
    response = viewset.allocate_resources(mock_request)

    print("\nAllocation results:")
    print(json.dumps(response.data, indent=2))

    # Verify assignments
    print("\nVerifying assignments...")
    for assignment in response.data:
        resource = Resource.objects.get(id=assignment["resource_id"])
        request = ResourceRequest.objects.get(id=assignment["request_id"])
        print(f"Resource '{resource.name}' assigned to request {request.id}")
        print(f"Assignment cost: {assignment['cost']}")


if __name__ == "__main__":
    print("Creating test data...")
    create_test_data()
    print("\nRunning allocation test...")
    test_allocation()
