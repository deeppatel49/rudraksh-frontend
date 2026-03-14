'use client';

import { useMemo } from 'react';

const DEFAULT_COORDS = { lat: 21.2003521, lng: 72.7821255 };

const MapComponent = ({ markers: stores, selectedStore }) => {
  const validStores = Array.isArray(stores)
    ? stores.filter((store) => Number.isFinite(store?.lat) && Number.isFinite(store?.lng))
    : [];

  const activeStore =
    Number.isFinite(selectedStore?.lat) && Number.isFinite(selectedStore?.lng)
      ? selectedStore
      : validStores[0] || DEFAULT_COORDS;

  const mapSrc = useMemo(() => {
    const { lat, lng } = activeStore;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
  }, [activeStore]);

  return (
    <div className="relative h-[300px] w-full sm:h-[360px] md:h-[450px] lg:h-[580px] xl:h-[680px]">
      <iframe
        title="Store location map"
        src={mapSrc}
        className="h-full w-full rounded-lg sm:rounded-2xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default MapComponent;
