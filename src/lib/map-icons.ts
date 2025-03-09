import L from 'leaflet';

// Define icon sizes and anchor points
const ICON_SIZE = [32, 32] as [number, number];
const ICON_ANCHOR = [16, 32] as [number, number];
const POPUP_ANCHOR = [0, -32] as [number, number];

// Create icon configurations for different incident types
export const incidentIcons = {
  DEFAULT: new L.Icon({
    iconUrl: '/icons/incident-default.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
  FIRE: new L.Icon({
    iconUrl: '/icons/incident-fire.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
  FLOOD: new L.Icon({
    iconUrl: '/icons/incident-flood.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
  MEDICAL: new L.Icon({
    iconUrl: '/icons/incident-medical.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
  STORM: new L.Icon({
    iconUrl: '/icons/incident-storm.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
  LANDSLIDE: new L.Icon({
    iconUrl: '/icons/incident-landslide.svg',
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
  }),
};

// Function to get icon based on incident type
export function getIncidentIcon(type: string): L.Icon {
  const normalizedType = type.toUpperCase();
  return incidentIcons[normalizedType as keyof typeof incidentIcons] || incidentIcons.DEFAULT;
} 