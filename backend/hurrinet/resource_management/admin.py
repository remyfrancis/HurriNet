from django.contrib import admin
from django.utils.safestring import mark_safe

# Try to import GIS admin classes, fall back to regular ModelAdmin if not available
try:
    from django.contrib.gis.admin import GeoModelAdmin

    geo_admin_class = GeoModelAdmin
except ImportError:
    # If GIS admin is not available, use regular ModelAdmin
    geo_admin_class = admin.ModelAdmin

from .models import Resource, InventoryItem, ResourceRequest, Distribution, Supplier


@admin.register(Resource)
class ResourceAdmin(geo_admin_class):
    list_display = (
        "name",
        "resource_type",
        "location",
        "address",
        "coverage_area",
        "assigned_to",
        "status",
        "capacity",
        "current_count",
        "current_workload",
        "managed_by",
        "get_stock_status",
    )
    list_filter = ("resource_type", "status")
    search_fields = ("name", "description", "address")
    readonly_fields = ("created_at", "updated_at", "stock_level_summary")
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "resource_type", "description", "status")},
        ),
        ("Capacity", {"fields": ("capacity", "current_count", "current_workload")}),
        ("Location", {"fields": ("location", "address", "coverage_area")}),
        (
            "Stock Levels",
            {"fields": ("stock_level_summary",)},
        ),
        (
            "Assignment",
            {
                "fields": (
                    "assigned_to",
                    "assigned_request",
                    "managed_by",
                    "last_assignment_cost",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def get_stock_status(self, obj):
        """Display summarized stock status in list view"""
        stock_levels = obj.get_stock_levels()
        low_count = sum(1 for data in stock_levels.values() if data["status"] == "Low")
        moderate_count = sum(
            1 for data in stock_levels.values() if data["status"] == "Moderate"
        )
        sufficient_count = sum(
            1 for data in stock_levels.values() if data["status"] == "Sufficient"
        )
        return f"🔴{low_count} 🟡{moderate_count} 🟢{sufficient_count}"

    get_stock_status.short_description = "Stock Status"

    def stock_level_summary(self, obj):
        """Display detailed stock levels in detail view"""
        stock_levels = obj.get_stock_levels()
        html = [
            '<table style="width:100%"><tr><th>Item Type</th><th>Status</th><th>Quantity</th><th>Capacity</th><th>%</th></tr>'
        ]

        for item_type, data in stock_levels.items():
            status_color = {
                "Low": "#ff4444",
                "Moderate": "#ffbb33",
                "Sufficient": "#00C851",
            }.get(data["status"], "gray")

            html.append(
                f"<tr>"
                f'<td>{item_type.replace("_", " ").title()}</td>'
                f'<td style="color: {status_color}">{data["status"]}</td>'
                f'<td>{data["quantity"]}</td>'
                f'<td>{data["capacity"]}</td>'
                f'<td>{data["percentage"]}%</td>'
                f"</tr>"
            )

        html.append("</table>")
        return mark_safe("".join(html))

    stock_level_summary.short_description = "Stock Levels"


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "item_type",
        "resource",
        "quantity",
        "capacity",
        "unit",
        "get_status",
        "get_percentage",
    )
    list_filter = ("item_type", "resource__resource_type")
    search_fields = ("name", "resource__name")
    readonly_fields = ("created_at", "updated_at", "stock_details")
    fieldsets = (
        ("Basic Information", {"fields": ("name", "item_type", "resource")}),
        (
            "Stock Information",
            {"fields": ("quantity", "capacity", "unit", "stock_details")},
        ),
        ("Supply Chain", {"fields": ("supplier",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def get_status(self, obj):
        """Display status with color indicator"""
        status = obj.calculate_status()
        status_icon = {"Low": "🔴", "Moderate": "🟡", "Sufficient": "🟢"}.get(
            status, "⚪"
        )
        return f"{status_icon} {status}"

    get_status.short_description = "Status"

    def get_percentage(self, obj):
        """Display percentage of capacity"""
        if obj.capacity <= 0:
            return "0%"
        percentage = (obj.quantity / obj.capacity) * 100
        return f"{percentage:.1f}%"

    get_percentage.short_description = "% of Capacity"

    def stock_details(self, obj):
        """Display detailed stock information"""
        details = obj.get_stock_details()
        status_color = {
            "Low": "#ff4444",
            "Moderate": "#ffbb33",
            "Sufficient": "#00C851",
        }.get(details["status"], "gray")

        html = f"""
        <div style="margin: 10px 0;">
            <p><strong>Status:</strong> <span style="color: {status_color}">{details['status']}</span></p>
            <p><strong>Quantity:</strong> {details['quantity']} {details['unit']}</p>
            <p><strong>Capacity:</strong> {details['capacity']} {details['unit']}</p>
            <p><strong>Usage:</strong> {details['percentage']}%</p>
        </div>
        """
        return mark_safe(html)

    stock_details.short_description = "Stock Details"


@admin.register(ResourceRequest)
class ResourceRequestAdmin(geo_admin_class):
    list_display = (
        "id",
        "resource",
        "item",
        "quantity",
        "status",
        "priority",
        "requester",
    )
    list_filter = ("status", "priority")
    search_fields = ("resource__name", "item__name")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Request Details",
            {"fields": ("resource", "item", "quantity", "status", "priority")},
        ),
        ("Location", {"fields": ("location",)}),
        ("Requester", {"fields": ("requester",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Distribution)
class DistributionAdmin(geo_admin_class):
    list_display = (
        "id",
        "resource",
        "total_requests",
        "fulfilled_requests",
        "completion_rate",
    )
    list_filter = ("resource__resource_type",)
    search_fields = ("resource__name",)
    readonly_fields = ("created_at", "updated_at", "completion_rate")

    def completion_rate(self, obj):
        if obj.total_requests == 0:
            return "0%"
        return f"{round((obj.fulfilled_requests / obj.total_requests) * 100, 2)}%"

    completion_rate.short_description = "Completion Rate"

    fieldsets = (
        (
            "Distribution Details",
            {
                "fields": (
                    "resource",
                    "total_requests",
                    "fulfilled_requests",
                )
            },
        ),
        ("Location", {"fields": ("location", "distribution_area")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Supplier)
class SupplierAdmin(geo_admin_class):
    list_display = (
        "name",
        "supplier_type",
        "status",
        "contact_name",
        "email",
        "phone",
    )
    list_filter = ("supplier_type", "status")
    search_fields = ("name", "description", "contact_name", "email", "address")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "supplier_type", "description", "status")},
        ),
        (
            "Contact Information",
            {"fields": ("contact_name", "email", "phone", "website")},
        ),
        ("Location", {"fields": ("address", "location")}),
        ("Additional Information", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
