import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useEffect } from "react";

// react-leaflet imports
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { type LeafletEvent } from "leaflet";

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

function MapClickHandler({ onClick }: any) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

const HomePage = () => {
  const [openStatus, setOpenStatus] = useState<boolean>(false);
  const [country, setCountry] = useState<string | null>(null);
  const [data, setData] = useState();
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((res) => res.json())
      .then((geojson) => setData(geojson));
  }, []);

  // helper to style the polygons
  const countryStyle = {
    fillColor: "#f2f2f2",
    color: "#555",
    weight: 1,
    fillOpacity: 0.6,
  };

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
            zoom={4}
            minZoom={3}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>
                {country ? `You clicked in ${country}` : "No country detected"}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
