// Saint Lucia districts with their approximate boundaries
const DISTRICTS = {
    'Castries': {
      bounds: {
        north: 14.0722,
        south: 13.9544,
        east: -60.9289,
        west: -61.0000
      }
    },
    'Gros Islet': {
      bounds: {
        north: 14.1000,
        south: 14.0722,
        east: -60.9289,
        west: -61.0000
      }
    },
    'Soufriere': {
      bounds: {
        north: 13.9544,
        south: 13.7500,
        east: -61.0000,
        west: -61.0800
      }
    },
    'Vieux Fort': {
      bounds: {
        north: 13.7500,
        south: 13.7000,
        east: -60.9289,
        west: -61.0000
      }
    },
    'Micoud': {
      bounds: {
        north: 13.9544,
        south: 13.7500,
        east: -60.8800,
        west: -60.9289
      }
    }
}
  
export function getDistrict(lat: number, lon: number): string {
for (const [district, data] of Object.entries(DISTRICTS)) {
    const { bounds } = data
    if (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lon >= bounds.west &&
    lon <= bounds.east
    ) {
    return district
    }
}
return 'Unknown District'
}