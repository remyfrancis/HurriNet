from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shelter
from .serializers import ShelterSerializer


class ShelterViewSet(viewsets.ModelViewSet):
    queryset = Shelter.objects.all()
    serializer_class = ShelterSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def update_occupancy(self, request, pk=None):
        shelter = self.get_object()
        new_occupancy = request.data.get("occupancy")

        if new_occupancy is None:
            return Response(
                {"error": "Occupancy value is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_occupancy = int(new_occupancy)
            if new_occupancy < 0:
                raise ValueError
        except ValueError:
            return Response(
                {"error": "Occupancy must be a non-negative integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shelter.update_occupancy(new_occupancy)
        serializer = self.get_serializer(shelter)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nearest(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        limit = int(request.query_params.get("limit", 5))

        if not lat or not lng:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {"error": "Invalid coordinates"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get shelters ordered by distance (simplified)
        shelters = Shelter.objects.filter(status="OPEN").order_by("?")[:limit]
        serializer = self.get_serializer(shelters, many=True)
        return Response(serializer.data)
