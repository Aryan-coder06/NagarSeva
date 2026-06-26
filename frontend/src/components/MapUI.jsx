import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { getCategoryConfig, getStatusConfig } from '../data/demoIssues';

const markerIcon = (category, status) => {
  const categoryColor = getCategoryConfig(category).marker;
  const statusColor = {
    open: 'red',
    pending: 'orange',
    'in progress': 'blue',
    resolved: 'green',
    closed: 'grey',
  }[String(status || 'open').toLowerCase()];
  const color = categoryColor || statusColor || 'blue';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const FitBounds = ({ issues, selectedIssue }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIssue?.coordinates?.latitude && selectedIssue?.coordinates?.longitude) {
      map.flyTo(
        [selectedIssue.coordinates.latitude, selectedIssue.coordinates.longitude],
        15,
        { duration: 0.8 }
      );
      return;
    }

    const points = issues
      .filter((issue) => issue.coordinates?.latitude && issue.coordinates?.longitude)
      .map((issue) => [issue.coordinates.latitude, issue.coordinates.longitude]);

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [issues, map, selectedIssue]);

  return null;
};

const MapUI = ({
  issues = [],
  height = '58vh',
  selectedIssue = null,
  onSelectIssue = () => {},
  mapView = 'street',
}) => {
  const center = [20.5937, 78.9629];
  const tileLayer = mapView === 'satellite'
    ? {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &copy; OpenStreetMap contributors',
      }
    : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
        <FitBounds issues={issues} selectedIssue={selectedIssue} />
        {issues.map((issue) => {
          const { coordinates } = issue;
          if (!coordinates?.latitude || !coordinates?.longitude) return null;
          const status = getStatusConfig(issue.status);
          const category = getCategoryConfig(issue.category);

          return (
            <Marker
              key={issue._id}
              position={[coordinates.latitude, coordinates.longitude]}
              icon={markerIcon(issue.category, issue.status)}
              eventHandlers={{ click: () => onSelectIssue(issue) }}
            >
              <Popup>
                <div className="w-72">
                  {issue.imageUrl && <img src={issue.imageUrl} alt="" className="mb-3 h-28 w-full rounded object-cover" />}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${category.badge}`}>
                      {category.label}
                    </span>
                  </div>
                  <strong className="block text-sm text-zinc-950">{issue.title}</strong>
                  <p className="text-xs text-zinc-600">{issue.city || 'Unknown area'} {issue.state ? `, ${issue.state}` : ''}</p>
                  {issue.userMessage && <p className="mt-2 text-xs leading-5 text-zinc-600 line-clamp-3">{issue.userMessage}</p>}
                  {issue.priorityScore && <p className="mt-2 text-xs font-semibold text-emerald-700">Priority score: {issue.priorityScore}</p>}
                  <button
                    type="button"
                    onClick={() => onSelectIssue(issue)}
                    className="mt-3 inline-flex items-center text-xs font-semibold text-zinc-900"
                  >
                    <MapPin className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    Open issue details
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapUI;
