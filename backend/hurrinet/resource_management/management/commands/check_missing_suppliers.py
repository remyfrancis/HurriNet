from django.core.management.base import BaseCommand
from resource_management.models import InventoryItem


class Command(BaseCommand):
    help = "Checks for Inventory Items that do not have a supplier assigned."

    def handle(self, *args, **options):
        missing_supplier_items = InventoryItem.objects.filter(supplier__isnull=True)
        count = missing_supplier_items.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS("All inventory items have a supplier assigned.")
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Found {count} inventory item(s) missing a supplier:"
                )
            )
            for item in missing_supplier_items:
                self.stdout.write(
                    f'  - ID: {item.id}, Name: "{item.name}", Quantity: {item.quantity}'
                )

            self.stdout.write(
                self.style.NOTICE(
                    "\nPlease assign a supplier to these items in the Django admin."
                )
            )
