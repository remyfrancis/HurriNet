# Resource Management Sample Data

This directory contains a Django management command to generate sample data for the resource management system in HurriNet.

## Overview

The sample data generator creates realistic test data for:

- Resources (shelters, medical facilities, supply depots, water distribution centers)
- Inventory items (specific supplies within resources)
- Resource requests (requests for resources from various locations)
- Distributions (distribution operations for resources)

The data is geographically accurate for Saint Lucia, with resources placed in major cities and towns.

## Usage

To generate sample data, run the following command from the project root:

```bash
python manage.py create_sample_data
```

### Command Options

You can customize the amount of data generated with the following options:

- `--resources`: Number of resources to create (default: 20)
- `--inventory`: Number of inventory items to create (default: 50)
- `--requests`: Number of resource requests to create (default: 30)
- `--distributions`: Number of distributions to create (default: 10)

Example:

```bash
python manage.py create_sample_data --resources 30 --inventory 100 --requests 50 --distributions 20
```

## Data Structure

### Resources

Resources are created with the following attributes:

- Name (based on location and resource type)
- Resource type (SHELTER, MEDICAL, SUPPLIES, WATER)
- Status (AVAILABLE, LIMITED, UNAVAILABLE, ASSIGNED)
- Capacity and current count
- Geographic location (point coordinates)
- Coverage area (polygon representing service area)

### Inventory Items

Inventory items are created with appropriate types based on the resource type:

- SHELTER: Beds, Blankets, Pillows, Cots, Tents, Sleeping Bags
- MEDICAL: First Aid Kits, Bandages, Antibiotics, Pain Relievers, IV Fluids, Surgical Masks
- SUPPLIES: Flashlights, Batteries, Radios, Tarps, Tools, Generators
- WATER: Bottled Water, Water Filters, Water Purification Tablets, Water Tanks, Water Pumps

### Resource Requests

Resource requests are created with:

- Link to a resource and inventory item
- Quantity requested
- Geographic location
- Status (pending, approved, in_progress, completed, rejected)
- Priority level

### Distributions

Distributions are created with:

- Geographic location
- Link to a resource
- Total requests and fulfilled requests count
- Distribution area (polygon)

## Visualization

The sample data can be visualized in the Resource Manager Dashboard:

1. Inventory page: `/resource-manager-dashboard/inventory`
2. Distribution page: `/resource-manager-dashboard/distribution`

## Notes

- The script creates an admin user if one doesn't exist (username: admin, password: admin)
- The script also creates 5 regular users for testing
- Geographic data uses the SRID 4326 (WGS84) coordinate system
- Coverage areas are simplified circle approximations
