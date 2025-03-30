const API_BASE_URL = 'http://localhost:8000'

// Mock Data
const MOCK_RESOURCES: ResourceFeature[] = [
  {
    type: 'Feature',
    geometry: [14.0101, -60.9789],
    id: 1,
    properties: {
      name: "St. Lucia Medical Center",
      resource_type: "MEDICAL",
      status: "ACTIVE",
      description: "Main medical facility in Castries",
      capacity: 1000,
      current_count: 750,
      current_workload: 75,
      address: "Castries, St. Lucia"
    }
  },
  {
    type: 'Feature',
    geometry: [13.9094, -60.9789],
    id: 2,
    properties: {
      name: "Vieux Fort Supply Depot",
      resource_type: "SUPPLIES",
      status: "ACTIVE",
      description: "Main supply warehouse",
      capacity: 2000,
      current_count: 1500,
      current_workload: 65,
      address: "Vieux Fort, St. Lucia"
    }
  },
  {
    type: 'Feature',
    geometry: [14.0167, -60.9833],
    id: 3,
    properties: {
      name: "Castries Water Treatment",
      resource_type: "WATER",
      status: "ACTIVE",
      description: "Water treatment and storage facility",
      capacity: 500,
      current_count: 400,
      current_workload: 80,
      address: "Castries, St. Lucia"
    }
  }
];

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Medical Supplies Kit",
    quantity: 200,
    capacity: 300,
    unit: "kits",
    resource: {
      id: 1,
      name: "St. Lucia Medical Center"
    },
    supplier: {
      id: 1,
      name: "St. Lucia Medical Supplies Ltd."
    },
    status: "IN_STOCK"
  },
  {
    id: 2,
    name: "Water Purification Tablets",
    quantity: 5000,
    capacity: 10000,
    unit: "tablets",
    resource: {
      id: 3,
      name: "Castries Water Treatment"
    },
    supplier: {
      id: 2,
      name: "Caribbean Water Solutions"
    },
    status: "IN_STOCK"
  },
  {
    id: 3,
    name: "Emergency Food Supplies",
    quantity: 1000,
    capacity: 2000,
    unit: "boxes",
    resource: {
      id: 2,
      name: "Vieux Fort Supply Depot"
    },
    supplier: {
      id: 3,
      name: "Regional Food Bank"
    },
    status: "IN_STOCK"
  }
];

const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 1,
    item: "Medical Supplies Kit",
    quantity: 50,
    source: "St. Lucia Medical Center",
    destination: "Vieux Fort Supply Depot",
    status: "pending",
    status_display: "Pending",
    created_at: "2024-03-17T10:00:00Z"
  },
  {
    id: 2,
    item: "Water Purification Tablets",
    quantity: 1000,
    source: "Castries Water Treatment",
    destination: "Vieux Fort Supply Depot",
    status: "completed",
    status_display: "Completed",
    created_at: "2024-03-16T15:30:00Z"
  }
];

interface ResourceProperties {
// ... existing interfaces ...

export default function InventoryTransfer() {
  // ... existing state declarations ...

  // Replace the useEffect with mock data
  useEffect(() => {
    // Simulate API call delay
    const loadMockData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResources(MOCK_RESOURCES);
        setInventoryItems(MOCK_INVENTORY);
        setTransfers(MOCK_TRANSFERS);
      } catch (error) {
        console.error('Error loading mock data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  // Modify handleTransfer to work with mock data
  const handleTransfer = async () => {
    if (!selectedItem || !sourceResource || !destinationResource || !transferQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all transfer details.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new mock transfer
      const newTransfer: Transfer = {
        id: transfers.length + 1,
        item: inventoryItems.find(item => item.id.toString() === selectedItem)?.name || "",
        quantity: parseInt(transferQuantity),
        source: resources.find(r => r.id.toString() === sourceResource)?.properties.name || "",
        destination: resources.find(r => r.id.toString() === destinationResource)?.properties.name || "",
        status: "pending",
        status_display: "Pending",
        created_at: new Date().toISOString()
      };

      setTransfers([...transfers, newTransfer]);
      setShowTransferDialog(false);
      
      toast({
        title: "Transfer initiated",
        description: "The inventory transfer has been started.",
      });
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast({
        title: "Transfer failed",
        description: "Failed to initiate the transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modify handleTransferAction to work with mock data
  const handleTransferAction = async (transferId: number, action: 'complete' | 'cancel') => {
    try {
      const updatedTransfers = transfers.map(transfer => {
        if (transfer.id === transferId) {
          return {
            ...transfer,
            status: action === 'complete' ? 'completed' : 'cancelled',
            status_display: action === 'complete' ? 'Completed' : 'Cancelled'
          };
        }
        return transfer;
      });

      setTransfers(updatedTransfers);

      toast({
        title: `Transfer ${action}d`,
        description: `The transfer has been ${action}d successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error);
      toast({
        title: `${action} failed`,
        description: `Failed to ${action} the transfer. Please try again.`,
        variant: "destructive",
      });
    }
  };

// ... rest of the existing code ...
} 