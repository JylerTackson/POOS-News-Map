// src/pages/Home/page.tsx
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Marker asset imports
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet’s default icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

export default function HomePage() {
  const [openStatus, setOpenStatus] = useState(false);
  const position: [number, number] = [51.505, -0.09];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <SidebarProvider
        open={openStatus}
        onOpenChange={setOpenStatus}
        className={openStatus ? "w-72" : "w-8"}
      >
        <AppSidebar />
        <main>
          <SidebarTrigger className="bg-gray-200 shadow pt-20 pb-20 border-2 border-black" />
        </main>
      </SidebarProvider>

      {/* Map */}
      <main className="flex-1 w-full p-4">
        <MapContainer
          center={position}
          zoom={4}
          minZoom={3}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>No country detected</Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  );
}
