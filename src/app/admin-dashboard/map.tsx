'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
})

// Custom marker icons for different types of locations
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

export default function Map() {
  useEffect(() => {
    // Initialize map
    const map = L.map('map').setView([13.9094, -60.9789], 11) // Saint Lucia coordinates

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Define emergency locations with different types
    const emergencyLocations = [
      {
        position: [14.0101, -60.9875], // Castries
        title: 'Hurricane Warning Zone',
        type: 'warning',
        description: 'Category 2 hurricane approaching. Evacuation recommended.',
        color: '#ef4444', // red
      },
      {
        position: [14.0833, -60.9500], // Gros Islet
        title: 'Flood Alert Area',
        type: 'alert',
        description: 'High risk of flooding. Prepare for evacuation.',
        color: '#f97316', // orange
      },
      {
        position: [13.7167, -60.9500], // Vieux Fort
        title: 'Emergency Shelter',
        type: 'shelter',
        description: 'Capacity: 500 people. Currently available.',
        color: '#22c55e', // green
      },
      {
        position: [13.8500, -61.0500], // Soufriere
        title: 'Medical Center',
        type: 'medical',
        description: '24/7 Emergency services available',
        color: '#3b82f6', // blue
      },
      {
        position: [13.9500, -60.9000], // Dennery
        title: 'Emergency Response Team',
        type: 'team',
        description: 'Search and rescue team deployed',
        color: '#8b5cf6', // purple
      },
    ]

    // Add markers and circles for emergency zones
    emergencyLocations.forEach((location) => {
      // Add marker with custom icon
      const marker = L.marker(location.position as L.LatLngExpression, {
        icon: createCustomIcon(location.color),
      })
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${location.title}</h3>
            <p class="text-sm">${location.description}</p>
          </div>
        `)
        .addTo(map)

      // Add circle to show affected area
      if (location.type === 'warning' || location.type === 'alert') {
        L.circle(location.position as L.LatLngExpression, {
          color: location.color,
          fillColor: location.color,
          fillOpacity: 0.2,
          radius: 2000, // 2km radius
        }).addTo(map)
      }
    })

    // Add legend
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend')
      div.innerHTML = `
        <div style="
          background: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        ">
          <h4 class="font-bold mb-2">Legend</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%;"></div>
              <span>Warning Zone</span>
            </div>
            <div class="flex items-center gap-2">
              <div style="background: #f97316; width: 12px; height: 12px; border-radius: 50%;"></div>
              <span>Alert Area</span>
            </div>
            <div class="flex items-center gap-2">
              <div style="background: #22c55e; width: 12px; height: 12px; border-radius: 50%;"></div>
              <span>Shelter</span>
            </div>
            <div class="flex items-center gap-2">
              <div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%;"></div>
              <span>Medical Center</span>
            </div>
            <div class="flex items-center gap-2">
              <div style="background: #8b5cf6; width: 12px; height: 12px; border-radius: 50%;"></div>
              <span>Response Team</span>
            </div>
          </div>
        </div>
      `
      return div
    }
    legend.addTo(map)

    // Cleanup
    return () => {
      map.remove()
    }
  }, [])

  return <div id="map" className="h-[500px] w-full rounded-lg" />
} 