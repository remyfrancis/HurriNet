import random
import math
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point, Polygon
from resource_management.models import (
    Resource,
    InventoryItem,
    ResourceRequest,
    Distribution,
)
from incidents.models import Incident

User = get_user_model()

# Saint Lucia coordinates (approximate)
SAINT_LUCIA_BOUNDS = {
    "min_lat": 13.7,
    "max_lat": 14.1,
    "min_lon": -61.1,
    "max_lon": -60.8,
}

# Major locations in Saint Lucia
LOCATIONS = [
    {"name": "Castries", "lat": 14.0101, "lon": -60.9970, "is_city": True},
    {"name": "Gros Islet", "lat": 14.0833, "lon": -60.9500, "is_city": True},
    {"name": "Soufrière", "lat": 13.8500, "lon": -61.0667, "is_city": True},
    {"name": "Vieux Fort", "lat": 13.7167, "lon": -60.9500, "is_city": True},
    {"name": "Micoud", "lat": 13.8167, "lon": -60.9000, "is_city": True},
    {"name": "Dennery", "lat": 13.9000, "lon": -60.9000, "is_city": True},
    {"name": "Laborie", "lat": 13.7500, "lon": -60.9833, "is_city": True},
    {"name": "Choiseul", "lat": 13.7833, "lon": -61.0500, "is_city": True},
    {"name": "Anse La Raye", "lat": 13.9500, "lon": -61.0333, "is_city": True},
    {"name": "Canaries", "lat": 13.9000, "lon": -61.0667, "is_city": True},
    {"name": "Pigeon Island", "lat": 14.0833, "lon": -60.9667, "is_city": False},
    {"name": "Marigot Bay", "lat": 13.9667, "lon": -61.0167, "is_city": False},
    {"name": "Rodney Bay", "lat": 14.0833, "lon": -60.9500, "is_city": False},
]


class Command(BaseCommand):
    help = "Creates sample data for the resource management system"

    def add_arguments(self, parser):
        parser.add_argument(
            "--resources", type=int, default=20, help="Number of resources to create"
        )
        parser.add_argument(
            "--inventory",
            type=int,
            default=50,
            help="Number of inventory items to create",
        )
        parser.add_argument(
            "--requests",
            type=int,
            default=30,
            help="Number of resource requests to create",
        )
        parser.add_argument(
            "--distributions",
            type=int,
            default=10,
            help="Number of distributions to create",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting to create sample data..."))

        # Create admin user if it doesn't exist
        if not User.objects.filter(username="admin").exists():
            try:
                # Try with username, email, password
                admin_user = User.objects.create_superuser(
                    username="admin", email="admin@example.com", password="admin"
                )
                self.stdout.write(self.style.SUCCESS("Created admin user"))
            except TypeError:
                # If that fails, try with just username and password
                admin_user = User.objects.create_superuser("admin", password="admin")
                self.stdout.write(
                    self.style.SUCCESS("Created admin user (alternate method)")
                )
        else:
            admin_user = User.objects.get(username="admin")

        # Create some regular users
        users = self._create_users(5)
        users.append(admin_user)

        # Create resources
        resources = self._create_resources(options["resources"], users)
        self.stdout.write(self.style.SUCCESS(f"Created {len(resources)} resources"))

        # Create inventory items
        inventory_items = self._create_inventory_items(options["inventory"], resources)
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(inventory_items)} inventory items")
        )

        # Create resource requests
        requests = self._create_resource_requests(
            options["requests"], resources, inventory_items, users
        )
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(requests)} resource requests")
        )

        # Create distributions
        distributions = self._create_distributions(options["distributions"], resources)
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(distributions)} distributions")
        )

        self.stdout.write(self.style.SUCCESS("Sample data creation completed!"))

    def _create_users(self, count):
        users = []
        for i in range(1, count + 1):
            username = f"user{i}"
            if not User.objects.filter(username=username).exists():
                try:
                    # Try with username, email, password
                    user = User.objects.create_user(
                        username=username,
                        email=f"user{i}@example.com",
                        password=f"password{i}",
                        first_name=f"First{i}",
                        last_name=f"Last{i}",
                    )
                except TypeError:
                    # If that fails, try with just username and password
                    user = User.objects.create_user(
                        username,
                        password=f"password{i}",
                    )
                    # Try to set first and last name if possible
                    try:
                        user.first_name = f"First{i}"
                        user.last_name = f"Last{i}"
                        user.save()
                    except:
                        pass

                users.append(user)
                self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
            else:
                users.append(User.objects.get(username=username))
        return users

    def _create_resources(self, count, users):
        resources = []
        resource_types = [choice[0] for choice in Resource.RESOURCE_TYPES]

        # Create resources in major cities first
        for location in LOCATIONS:
            if len(resources) >= count:
                break

            if location["is_city"]:
                resource_type = random.choice(resource_types)
                capacity = random.randint(50, 500)

                # Create a coverage area (simple circle approximation)
                center = Point(location["lon"], location["lat"])

                resource = Resource.objects.create(
                    name=f"{location['name']} {self._get_resource_type_name(resource_type)}",
                    resource_type=resource_type,
                    description=f"Emergency {resource_type.lower()} resource in {location['name']}",
                    status=random.choice(
                        [choice[0] for choice in Resource.STATUS_CHOICES]
                    ),
                    capacity=capacity,
                    current_count=random.randint(int(capacity * 0.3), capacity),
                    current_workload=random.randint(0, int(capacity * 0.7)),
                    location=center,
                    address=f"{random.randint(1, 100)} Main St, {location['name']}, Saint Lucia",
                    coverage_area=self._create_coverage_polygon(
                        center, 0.05
                    ),  # ~5km radius
                    managed_by=random.choice(users),
                )

                # Update status based on capacity and workload
                resource.update_status()
                resources.append(resource)

        # Fill remaining with random locations
        for i in range(len(resources), count):
            lat = random.uniform(
                SAINT_LUCIA_BOUNDS["min_lat"], SAINT_LUCIA_BOUNDS["max_lat"]
            )
            lon = random.uniform(
                SAINT_LUCIA_BOUNDS["min_lon"], SAINT_LUCIA_BOUNDS["max_lon"]
            )
            resource_type = random.choice(resource_types)
            capacity = random.randint(20, 200)

            center = Point(lon, lat)

            resource = Resource.objects.create(
                name=f"Resource {i+1} - {self._get_resource_type_name(resource_type)}",
                resource_type=resource_type,
                description=f"Emergency {resource_type.lower()} resource",
                status=random.choice([choice[0] for choice in Resource.STATUS_CHOICES]),
                capacity=capacity,
                current_count=random.randint(int(capacity * 0.3), capacity),
                current_workload=random.randint(0, int(capacity * 0.7)),
                location=center,
                address=f"Rural Route {random.randint(1, 50)}, Saint Lucia",
                coverage_area=self._create_coverage_polygon(
                    center, 0.03
                ),  # ~3km radius
                managed_by=random.choice(users),
            )

            # Update status based on capacity and workload
            resource.update_status()
            resources.append(resource)

        return resources

    def _create_inventory_items(self, count, resources):
        items = []

        # Common inventory items by resource type
        inventory_types = {
            "SHELTER": [
                "Beds",
                "Blankets",
                "Pillows",
                "Cots",
                "Tents",
                "Sleeping Bags",
            ],
            "MEDICAL": [
                "First Aid Kits",
                "Bandages",
                "Antibiotics",
                "Pain Relievers",
                "IV Fluids",
                "Surgical Masks",
            ],
            "SUPPLIES": [
                "Flashlights",
                "Batteries",
                "Radios",
                "Tarps",
                "Tools",
                "Generators",
            ],
            "WATER": [
                "Bottled Water",
                "Water Filters",
                "Water Purification Tablets",
                "Water Tanks",
                "Water Pumps",
            ],
        }

        units = ["units", "boxes", "pallets", "kits", "gallons", "liters", "kg"]

        # Create inventory items for each resource
        for resource in resources:
            # Determine how many items to create for this resource
            items_per_resource = min(5, max(1, count // len(resources)))

            # Get appropriate item types for this resource
            item_types = inventory_types.get(
                resource.resource_type, inventory_types["SUPPLIES"]
            )

            for i in range(items_per_resource):
                if len(items) >= count:
                    break

                item_name = random.choice(item_types)
                capacity = random.randint(50, 500)

                item = InventoryItem.objects.create(
                    name=item_name,
                    quantity=random.randint(int(capacity * 0.3), capacity),
                    unit=random.choice(units),
                    capacity=capacity,
                    resource=resource,
                )
                items.append(item)

        # Create any remaining items with random resources
        for i in range(len(items), count):
            resource = random.choice(resources)
            item_types = inventory_types.get(
                resource.resource_type, inventory_types["SUPPLIES"]
            )
            item_name = random.choice(item_types)
            capacity = random.randint(50, 500)

            item = InventoryItem.objects.create(
                name=item_name,
                quantity=random.randint(int(capacity * 0.3), capacity),
                unit=random.choice(units),
                capacity=capacity,
                resource=resource,
            )
            items.append(item)

        return items

    def _create_resource_requests(self, count, resources, inventory_items, users):
        requests = []
        statuses = [choice[0] for choice in ResourceRequest.STATUS_CHOICES]

        for i in range(count):
            # Select a random location in Saint Lucia
            if random.random() < 0.7:  # 70% chance to use a predefined location
                location = random.choice(LOCATIONS)
                point = Point(location["lon"], location["lat"])
            else:
                lat = random.uniform(
                    SAINT_LUCIA_BOUNDS["min_lat"], SAINT_LUCIA_BOUNDS["max_lat"]
                )
                lon = random.uniform(
                    SAINT_LUCIA_BOUNDS["min_lon"], SAINT_LUCIA_BOUNDS["max_lon"]
                )
                point = Point(lon, lat)

            # Select a random resource and inventory item
            resource = random.choice(resources)
            item = (
                random.choice(
                    [item for item in inventory_items if item.resource == resource]
                )
                if random.random() < 0.8
                else None
            )

            # Create the request
            request = ResourceRequest.objects.create(
                resource=resource,
                item=item,
                quantity=random.randint(1, 50),
                requester=random.choice(users),
                location=point,
                status=random.choice(statuses),
                priority=random.randint(0, 5),
                created_at=datetime.now() - timedelta(days=random.randint(0, 30)),
            )
            requests.append(request)

        return requests

    def _create_distributions(self, count, resources):
        distributions = []

        for i in range(count):
            # Select a random location in Saint Lucia
            if random.random() < 0.7:  # 70% chance to use a predefined location
                location = random.choice(LOCATIONS)
                point = Point(location["lon"], location["lat"])
            else:
                lat = random.uniform(
                    SAINT_LUCIA_BOUNDS["min_lat"], SAINT_LUCIA_BOUNDS["max_lat"]
                )
                lon = random.uniform(
                    SAINT_LUCIA_BOUNDS["min_lon"], SAINT_LUCIA_BOUNDS["max_lon"]
                )
                point = Point(lon, lat)

            # Select a random resource
            resource = random.choice(resources)

            # Create distribution area
            distribution_area = self._create_coverage_polygon(
                point, 0.02
            )  # ~2km radius

            # Create the distribution
            total_requests = random.randint(10, 100)
            fulfilled_requests = random.randint(0, total_requests)

            distribution = Distribution.objects.create(
                location=point,
                resource=resource,
                total_requests=total_requests,
                fulfilled_requests=fulfilled_requests,
                distribution_area=distribution_area,
                created_at=datetime.now() - timedelta(days=random.randint(0, 14)),
            )
            distributions.append(distribution)

        return distributions

    def _create_coverage_polygon(self, center, radius):
        """Create a simple polygon approximating a circle around the center point"""
        # This is a simplified approach - for a proper circle, more points would be needed
        num_points = 8
        coords = []

        for i in range(num_points):
            angle = 2 * 3.14159 * i / num_points
            dx = radius * 0.8 * math.cos(angle)  # Adjust for longitude compression
            dy = radius * math.sin(angle)
            coords.append((center.x + dx, center.y + dy))

        # Close the polygon
        coords.append(coords[0])

        return Polygon(coords)

    def _get_resource_type_name(self, resource_type):
        """Get a human-readable name for a resource type code"""
        type_dict = dict(Resource.RESOURCE_TYPES)
        return type_dict.get(resource_type, resource_type)
