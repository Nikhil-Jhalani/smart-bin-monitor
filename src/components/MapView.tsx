import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bin } from '../types';
import { getStatusColor, formatRelativeTime } from '../utils/formatters';
import { MapPin, Navigation, Filter, ExternalLink, Check, Flame, Layers } from 'lucide-react';

interface MapViewProps {
  bins: Bin[];
  onSelectBin: (bin: Bin) => void;
  onCleanBin: (binId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ bins, onSelectBin, onCleanBin }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  // Filtered bins for map
  const displayBins = bins.filter((bin) => {
    if (activeFilter === 'urgent') return bin.status === 'urgent' || bin.fillLevel >= 90;
    if (activeFilter === 'full') return bin.fillLevel >= 80;
    if (activeFilter === 'normal') return bin.status === 'normal' || bin.fillLevel <= 15;
    if (activeFilter === 'overdue') return bin.status === 'overdue';
    return true;
  });

  // Center of city calculated from bins
  const defaultCenter: [number, number] = bins.length > 0 
    ? [bins[0].latitude, bins[0].longitude] 
    : [28.6139, 77.2090];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: true,
      });

      // Professional clean carto / OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SmartBin Municipality GIS',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when bins or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for current display bins
    displayBins.forEach((bin) => {
      const isUrgent = bin.status === 'urgent' || bin.fillLevel >= 90;
      const isFull = bin.fillLevel >= 80 && bin.fillLevel < 90;
      const isPartial = bin.status === 'partially_full' || (bin.fillLevel >= 40 && bin.fillLevel < 80);
      const isOverdue = bin.status === 'overdue';

      // Pin Color Hex
      let pinColor = '#10b981'; // Green
      let markerClass = 'border-emerald-600 bg-emerald-500';
      if (isUrgent) {
        pinColor = '#ef4444'; // Red
        markerClass = 'border-rose-600 bg-rose-500 pulse-urgent';
      } else if (isFull) {
        pinColor = '#f43f5e'; // Red
        markerClass = 'border-red-600 bg-red-500';
      } else if (isOverdue) {
        pinColor = '#f59e0b'; // Orange
        markerClass = 'border-amber-600 bg-amber-500';
      } else if (isPartial) {
        pinColor = '#eab308'; // Yellow
        markerClass = 'border-yellow-600 bg-yellow-500';
      }

      // Create Custom HTML Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-bin-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: ${pinColor}; color: white; padding: 3px 6px; border-radius: 9999px; font-size: 11px; font-weight: 800; font-family: monospace; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 3px;">
              <span>${bin.fillLevel}%</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${pinColor}; margin-top: -1px;"></div>
            ${isUrgent ? '<div style="position: absolute; top: -6px; right: -6px; width: 10px; height: 10px; background-color: #dc2626; border-radius: 9999px; border: 2px solid white; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
      });

      const marker = L.marker([bin.latitude, bin.longitude], { icon: customIcon }).addTo(map);

      // Status info for popup
      const statusInfo = getStatusColor(bin.status);

      // Popup Content HTML
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-1 font-sans text-slate-800 text-xs min-w-[210px]';
      popupHtml.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 14px; font-family: monospace; color: #047857;">${bin.id}</strong>
          <span style="background-color: ${statusInfo.hex}20; color: ${statusInfo.hex}; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold; border: 1px solid ${statusInfo.hex}40;">
            ${statusInfo.label}
          </span>
        </div>
        <p style="color: #475569; font-size: 11px; margin-bottom: 8px;">${bin.location}</p>
        
        <div style="background-color: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
            <span>Fill Level:</span>
            <strong>${bin.fillLevel}%</strong>
          </div>
          <div style="background-color: #e2e8f0; height: 6px; border-radius: 9999px; overflow: hidden;">
            <div style="background-color: ${pinColor}; height: 100%; width: ${bin.fillLevel}%;"></div>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Last cleaned: ${formatRelativeTime(bin.lastCleaned)}
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <button id="clean-btn-${bin.id}" style="flex: 1; background-color: #10b981; color: white; border: none; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ✓ Clean Bin
          </button>
          <button id="view-btn-${bin.id}" style="background-color: #0f172a; color: white; border: none; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
            Details
          </button>
        </div>
      `;

      // Attach button event listeners inside popup
      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const cleanBtn = document.getElementById(`clean-btn-${bin.id}`);
        const viewBtn = document.getElementById(`view-btn-${bin.id}`);
        if (cleanBtn) cleanBtn.onclick = () => onCleanBin(bin.id);
        if (viewBtn) viewBtn.onclick = () => onSelectBin(bin);
      });

      marker.on('click', () => {
        setSelectedBinId(bin.id);
      });

      markersRef.current[bin.id] = marker;
    });

    // Fit map bounds if bins exist
    if (displayBins.length > 0) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [displayBins.length, activeFilter]);

  // Pan to a specific bin
  const handleFlyToBin = (bin: Bin) => {
    setSelectedBinId(bin.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([bin.latitude, bin.longitude], 16, { duration: 1.2 });
      const marker = markersRef.current[bin.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Filter Controls Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mr-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Map Layers:</span>
          </div>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Bins ({bins.length})
          </button>

          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Urgent / Full ({bins.filter(b => b.status === 'urgent' || b.fillLevel >= 90).length})
          </button>

          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'overdue'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Overdue ({bins.filter(b => b.status === 'overdue').length})
          </button>

          <button
            onClick={() => setActiveFilter('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'normal'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Normal (Green)
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Normal (&lt;60%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Partial (40-79%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Overdue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Urgent (≥90%)
          </span>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Leaflet Map Container (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative min-h-[560px] flex flex-col">
          <div ref={mapContainerRef} className="w-full flex-1 min-h-[560px] z-0" />
        </div>

        {/* Bin Location Fast-Selector Sidebar (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Field Dustbins ({displayBins.length})
            </h3>
            <span className="text-[10px] text-slate-400">Click to locate</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1">
            {displayBins.map((bin) => {
              const statusInfo = getStatusColor(bin.status);
              const isSelected = selectedBinId === bin.id;

              return (
                <div
                  key={bin.id}
                  onClick={() => handleFlyToBin(bin)}
                  className={`py-3 px-2 rounded-xl cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected ? 'bg-emerald-50/80 ring-1 ring-emerald-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{bin.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      {bin.fillLevel}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1">{bin.location}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>GPS: {bin.latitude.toFixed(3)}, {bin.longitude.toFixed(3)}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      Locate <Navigation className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
