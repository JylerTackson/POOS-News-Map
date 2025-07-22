// src/pages/Home/page.tsx
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { API_ENDPOINTS } from "@/api";
import type { NewsItem } from "@/components/newsCards/newsCard";

import { useUser } from "@/Contexts/UserContext";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";

// Marker asset imports
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// Map of country names to country codes (matching your backend)
const countryNameToCode: { [key: string]: string } = {
  "United Arab Emirates": "ae",
  "Argentina": "ar",
  "Austria": "at",
  "Australia": "au",
  "Belgium": "be",
  "Bulgaria": "bg",
  "Brazil": "br",
  "Canada": "ca",
  "Switzerland": "ch",
  "China": "cn",
  "Colombia": "co",
  "Cuba": "cu",
  "Czech Republic": "cz",
  "Germany": "de",
  "Egypt": "eg",
  "France": "fr",
  "United Kingdom": "gb",
  "Greece": "gr",
  "Hong Kong": "hk",
  "Hungary": "hu",
  "Indonesia": "id",
  "Ireland": "ie",
  "Israel": "il",
  "India": "in",
  "Italy": "it",
  "Japan": "jp",
  "South Korea": "kr",
  "Lithuania": "lt",
  "Latvia": "lv",
  "Morocco": "ma",
  "Mexico": "mx",
  "Malaysia": "my",
  "Nigeria": "ng",
  "Netherlands": "nl",
  "Norway": "no",
  "New Zealand": "nz",
  "Philippines": "ph",
  "Poland": "pl",
  "Portugal": "pt",
  "Romania": "ro",
  "Serbia": "rs",
  "Russia": "ru",
  "Saudi Arabia": "sa",
  "Sweden": "se",
  "Singapore": "sg",
  "Slovenia": "si",
  "Slovakia": "sk",
  "Thailand": "th",
  "Turkey": "tr",
  "Taiwan": "tw",
  "Ukraine": "ua",
  "United States": "us",
  "USA": "us", // Alternative name
  "Venezuela": "ve",
  "South Africa": "za"
};

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function HomePage() {
  const [openStatus, setOpenStatus] = useState(true); // Start with sidebar open
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([51.505, -0.09]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [country, setCountry] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser(); // ADD THIS LINE

  // Function to get country from coordinates using reverse geocoding
  const getCountryFromCoords = async (lat: number, lng: number) => {
  try {
    const response = await fetch(API_ENDPOINTS.getCountryFromCoords(lat, lng));
    const data = await response.json();
    return data.country;
  } catch (error) {
    console.error("Error getting country:", error);
    return null;
  }
};

  // Function to fetch news for a country
  const fetchNewsForCountry = async (countryCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.newsByCountry(countryCode));
      
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    
    // Get country from coordinates
    const countryName = await getCountryFromCoords(lat, lng);
    
    console.log("Country detected:", countryName); // Debug log

    if (countryName) {
      setCountry(countryName);
      
      // Get country code
      const countryCode = countryNameToCode[countryName];
      
      console.log("Country code:", countryCode); // Debug log

      if (countryCode) {
        // Fetch news for this country
        await fetchNewsForCountry(countryCode);
        // Open sidebar to show news
        setOpenStatus(true);
      } else {
        // Country not in our supported list

        console.log("Country not supported:", countryName); // Debug log

        setNews([]);
        setOpenStatus(true);
      }
    } else {
      // Clicked on ocean or couldn't determine country
      setCountry("Unknown Location");
      setNews([]);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <SidebarProvider
        open={openStatus}
        onOpenChange={setOpenStatus}
        className={openStatus ? "w-70" : "w-8"}
      >
        <AppSidebar news={news} country={country} loading={loading} user={user} />
        <main>
          <SidebarTrigger className="bg-gray-200 shadow pt-20 pb-20 border-2 border-black" />
        </main>
      </SidebarProvider>

      {/* Map */}
      <main className="flex-1 w-full p-4">
        <MapContainer
          center={markerPosition}
          zoom={4}
          maxZoom={6}
          minZoom={3}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            url={`https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${'iLN3RsKjVNJGEELPbWNfdlFO4XHFLXhh8pnKGdsYiBum5KupTE656YhfjLImPzBV'}`}
            subdomains={["a","b","c","d"]}
            attribution={`
              &copy; <a href="https://www.jawg.io?utm_medium=map&utm_source=attribution" target="_blank">Jawg</a>
              — &copy; <a href="https://www.openstreetmap.org?utm_medium=map-attribution&utm_source=jawg" target="_blank">OpenStreetMap</a> contributors
            `}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <Marker position={markerPosition}>
            <Popup>
              <div>
                <strong>{country || "Click to detect country"}</strong><br/>
                Lat: {markerPosition[0].toFixed(4)}<br/>
                Lng: {markerPosition[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  );
}