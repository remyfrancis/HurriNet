import requests
from datetime import datetime
from django.conf import settings

class WeatherAlertService:
    def __init__(self):
        self.api_key = settings.TOMORROW_API_KEY
        self.base_url = "https://api.tomorrow.io/v4"
        # Saint Lucia coordinates
        self.locations = {
            'Castries': {'lat': 14.0101, 'lon': -60.9875},
            'Gros Islet': {'lat': 14.0722, 'lon': -60.9498},
            'Soufriere': {'lat': 13.8566, 'lon': -61.0564},
            'Vieux Fort': {'lat': 13.7246, 'lon': -60.9490},
        }

    def get_alerts(self):
        alerts = []
        for district, coords in self.locations.items():
            url = f"{self.base_url}/weather/realtime"
            params = {
                'location': f"{coords['lat']},{coords['lon']}",
                'apikey': self.api_key,
                'units': 'metric'
            }

            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Extract weather values
                values = data['data']['values']
                
                # Check conditions and create alerts
                if values['windSpeed'] > 15:  # Wind speed > 54 km/h
                    alerts.append({
                        'title': 'High Wind Alert',
                        'type': 'wind',
                        'severity': 'High',
                        'district': district,
                        'active': True
                    })

                if values['precipitationIntensity'] > 7.6:  # Heavy rain
                    alerts.append({
                        'title': 'Heavy Rain Alert',
                        'type': 'precipitation',
                        'severity': 'Medium',
                        'district': district,
                        'active': True
                    })

                if values['temperature'] > 32:  # High temperature
                    alerts.append({
                        'title': 'High Temperature Alert',
                        'type': 'temperature',
                        'severity': 'Low',
                        'district': district,
                        'active': True
                    })

            except Exception as e:
                print(f"Error fetching weather data for {district}: {str(e)}")

        return alerts