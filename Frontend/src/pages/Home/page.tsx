import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

// react-leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issues
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useState } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const HomePage = () => {
  const [openStatus, setOpenStatus] = useState<boolean>(false);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <SidebarProvider
        open={openStatus}
        onOpenChange={setOpenStatus}
        className={openStatus ? "w-72" : "w-8"}
      >
        <div>
          <AppSidebar />
        </div>
        <main>
          <SidebarTrigger className="bg-gray-200 shadow pt-20 pb-20 border-2 border-black" />
        </main>
      </SidebarProvider>

      {/* Main content with Leaflet map */}
      <main className="flex-1 w-full pt-4 pr-4 pb-4">
        <div className="h-full w-full">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={3}
            minZoom={3}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.505, -0.09]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
