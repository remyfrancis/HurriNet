import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Stethoscope, Siren, Users2, Boxes, UsersIcon, SettingsIcon, BellIcon, HeartHandshake } from "lucide-react";
import { Sidebar } from "@/components/Sidebar/index"
import { AlertProvider } from "@/contexts/AlertContext"
import { SupplierUpdatesProvider } from "@/contexts/SupplierUpdatesContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HurriNet",
  description: "HurriNet is a platform for emergency management and response.",
};

const sidebarItems = [
  {
    key: "hq-dashboard",
    title: "HQ Dashboard",
    href: "/emergency-hq",
    icon: <Users2 className="w-4 h-4" />,
  },
  {
    key: "citizen-dashboard",
    title: "Citizen Dashboard",
    href: "/citizen-dashboard",
    icon: <Users2 className="w-4 h-4" />,
  },
  {
    key: "emergency-personnel-dashboard",
    title: "Emergency Personnel Dashboard",
    href: "/emergency-personnel-dashboard",
    icon: <Siren className="w-4 h-4" />,
    items: [
      {
        key: "incident-status",
        title: "Incident Status",
        href: "/emergency-personnel-dashboard/incident-status",
      },
      {
        key: "report-incident",
        title: "Report Incident",
        href: "/emergency-personnel-dashboard/report-incident",
      },
      {
        key: "resource-locator",
        title: "Resource Locator",
        href: "/emergency-personnel-dashboard/resource-locator",
      },
    ],
  },
  {
    key: "medical-dashboard",
    title: "Medical Dashboard",
    href: "/medical-dashboard",
    icon: <Stethoscope className="w-4 h-4" />,
    items: [
      {
        key: "facilities",
        title: "Facilities",
        href: "/medical-dashboard/facilities",
      },
      {
        key: "medical-supplies",
        title: "Medical Supplies",
        href: "/medical-dashboard/medical-supplies",
      },
      {
        key: "medical-staff",
        title: "Medical Staff",
        href: "/medical-dashboard/medical-staff",
      },
      {
        key: "non-medical-supplies",
        title: "Non-Medical Supplies",
        href: "/medical-dashboard/non-medical-supplies",
      },
    ],
  },
  {
    key: "resource-management",
    title: "Resource Manager Dashboard",
    href: "/resource-manager-dashboard",
    icon: <Boxes className="w-4 h-4" />,
    items: [
      {
        key: "distribution",
        title: "Distribution",
        href: "/resource-manager-dashboard/distribution",
      },
      {
        key: "emergency-request",
        title: "Emergency Request",
        href: "/resource-manager-dashboard/emergency-request",
      },
      {
        key: "inventory-monitoring",
        title: "Inventory Monitoring",
        href: "/resource-manager-dashboard/inventory-monitoring",
      },
      {
        key: "stock-assessment",
        title: "Stock Assessment",
        href: "/resource-manager-dashboard/stock-assessment",
      },
      {
        key: "procurement",
        title: "Procurement",
        href: "/resource-manager-dashboard/procurement",
      },
    ],
  },
  // {
  //   key: "alert-management",
  //   title: "Alert Management",
  //   href: "/admin/alerts",
  //   icon: <BellIcon className="w-4 h-4" />
  // }
]


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AlertProvider>
          <div className="flex h-screen">
            {/* <Sidebar items={sidebarItems} /> */}
            <main className="flex-1">
              <SupplierUpdatesProvider>
                {children}
              </SupplierUpdatesProvider>
            </main>
          </div>
        </AlertProvider>
      </body>
    </html>
  );
}
