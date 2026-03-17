'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  ExternalLink,
  MapPin,
  MapPinned,
  MessageCircle,
  Navigation,
  Phone,
  Search,
} from 'lucide-react';

const storesSeed = [
  {
    id: 1,
    name: 'Rudraksh Pharmacy',
    pincode: 395009,
    area: 'L.P. Savani Circle, Adajan',
    address: 'Shop No. 9, L.P. Savani Shopping Center, Near L.P. Savani Circle, Adajan, Surat - 395009',
    phone: '9979979688',
    lat: 21.2003521,
    lng: 72.7821255,
    hours: '9:00 AM - 10:00 PM',
    badge: 'Popular',
  },
  {
    id: 2,
    name: 'Rudraksh Pharmacy',
    pincode: 394101,
    area: 'VIP Circle, Mota Varacha',
    address: 'G-17M, Shreenathji Icon, Opp. Utran Power Station, VIP Circle, Mota Varacha, Surat - 394101',
    phone: '9925361148',
    lat: 21.2320897,
    lng: 72.8668198,
    hours: '24 Hours',
    badge: '24/7',
  },
  {
    id: 3,
    name: 'Rudraksh Medical Store',
    pincode: 395006,
    area: 'Mini Bazar, Varacha',
    address: 'Shop No. 1, Mira Nagar Society, Near Chopati, Opp. Multilevel Parking, Varacha, Surat - 395006',
    phone: '9979979688',
    lat: 21.2188437,
    lng: 72.8473839,
    hours: '9:00 AM - 9:00 PM',
    badge: 'Convenient',
  },
  {
    id: 4,
    name: 'Metro Pharmacy',
    pincode: 395009,
    area: 'L.P. Savani Circle, Adajan',
    address: 'Shop No. 12-13, L.P. Savani Shopping Center, Near L.P. Savani Circle, Adajan, Surat - 395009',
    phone: '9979979688',
    lat: 21.2003164,
    lng: 72.7802124,
    hours: '9:00 AM - 10:00 PM',
    badge: 'Convenient',
  },
  {
    id: 5,
    name: 'Rudraksh Chemist',
    pincode: 395008,
    area: 'Ashwini Kumar Road',
    address: 'Shop No. A/1, Shivanjali Complex, Opposite Swaminarayan Hotel, Near Patel Nagar Hall, A.K. Road, Surat - 395008',
    phone: '9979979688',
    lat: 21.2074396,
    lng: 72.7908351,
    hours: '9:00 AM - 10:00 PM',
    badge: 'Convenient',
  },
  {
    id: 6,
    name: 'Rudraksh Healthcare',
    pincode: 395004,
    area: 'Vasta Devdi Road',
    address: 'C-18, 1st Floor, Sagar Compound, Vasta Devdi Road, Katargam, Surat - 395004',
    phone: '9979979688',
    lat: 21.2158716,
    lng: 72.8364656,
    hours: '9:00 AM - 10:00 PM',
    badge: 'Convenient',
  },
];

export default function StoreLocatorView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(storesSeed[0]);
  const [mapFailed, setMapFailed] = useState(false);

  const filteredStores = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return storesSeed;

    return storesSeed.filter((store) => {
      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query) ||
        store.area.toLowerCase().includes(query) ||
        String(store.pincode).includes(query)
      );
    });
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedStore || !filteredStores.some((store) => store.id === selectedStore.id)) {
      setSelectedStore(filteredStores[0] ?? null);
    }
  }, [filteredStores, selectedStore]);

  useEffect(() => {
    setMapFailed(false);
  }, [selectedStore?.id]);

  const activeStore = selectedStore || filteredStores[0] || storesSeed[0];

  const mapSrc = useMemo(() => {
    if (!activeStore) {
      return null;
    }

    const lat = activeStore.lat;
    const lng = activeStore.lng;
    const encodedPlace = encodeURIComponent(`${activeStore.name}, ${activeStore.address}`);
    return {
      embed: `https://maps.google.com/maps?output=embed&q=${encodeURIComponent(`${lat},${lng}`)}&z=15`,
      googleMapsLink: `https://www.google.com/maps/place/${encodedPlace}/@${lat},${lng},14z`,
      googleSearchLink: `https://www.google.com/maps/search/?api=1&query=${encodedPlace}`,
      osmLink: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`,
    };
  }, [activeStore]);

  const openDirections = (store) => {
    const query = encodeURIComponent(`${store.name}, ${store.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const openWhatsApp = (store) => {
    const text = `Hello, I need details for ${store.name}. Address: ${store.address}`;
    window.open(`https://wa.me/919979979688?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="store-locator-section section container py-5 md:py-6 lg:py-8" suppressHydrationWarning>
      <header className="mx-auto mb-4 max-w-4xl text-center md:mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <MapPinned className="h-4 w-4" />
          Find Your Nearest Store
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">Our Store Locations</h1>
        <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          Visit any of our pharmacy stores for medicines, prescription support, and pharmacist guidance.
        </p>
      </header>

      <div className="store-layout grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-4">
        <aside className="store-list-panel rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:h-[620px]">
          <div className="store-search-wrap mb-3">
            <div className="store-search-head mb-2.5 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700">Search Stores</p>
              <p className="store-meta-line text-xs font-medium text-slate-500">
                {filteredStores.length} store{filteredStores.length === 1 ? '' : 's'} available
              </p>
            </div>

            <label className="store-search-field block">
              <span className="sr-only">Search stores</span>
              <span className="store-search-control">
                <Search className="store-search-icon h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, area, address, or pincode"
                className="store-search-input h-11 w-full bg-transparent text-sm text-slate-800 outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="store-search-clear inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <span aria-hidden="true">x</span>
                </button>
              ) : null}
              </span>
            </label>
          </div>

          <div className="store-scroll flex-1 space-y-2.5 overflow-y-auto pr-1">
            {filteredStores.length ? (
              filteredStores.map((store) => (
                <article
                  key={store.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedStore(store)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedStore(store);
                    }
                  }}
                  className={`store-card w-full cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selectedStore?.id === store.id
                      ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                  aria-label={`Select ${store.name} in ${store.area}`}
                >
                  <div className="store-card-head flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="store-card-title text-base font-semibold text-slate-900">{store.name}</h2>
                      <p className="store-card-area mt-0.5 text-sm text-slate-600">{store.area}</p>
                    </div>
                    <span className="store-card-badge rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {store.badge}
                    </span>
                  </div>

                  <div className="store-card-body mt-3 space-y-2 text-sm text-slate-700">
                    <div className="store-card-row flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="leading-[1.4]">{store.address}</p>
                    </div>
                    <div className="store-card-row flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>{store.hours}</span>
                    </div>
                    <div className="store-card-row flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                      <a href={`tel:${store.phone}`} className="store-phone-link font-semibold text-blue-700">
                        {store.phone}
                      </a>
                    </div>
                  </div>

                  <div className="store-card-actions mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDirections(store);
                      }}
                      className="store-action-btn inline-flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Directions
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openWhatsApp(store);
                      }}
                      className="store-action-btn inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDirections(store);
                      }}
                      className="store-action-btn store-action-btn-icon inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-2 py-2 text-violet-700"
                      title="Open in Maps"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">No matching stores found</p>
                <p className="mt-1 text-xs text-slate-500">Try a different keyword or pincode.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="store-map-panel rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[620px]">
          {activeStore ? (
            <>
              <div className="store-map-head border-b border-slate-200 px-4 py-3 md:px-5 md:py-4">
                <div className="store-map-head-copy">
                  <p className="store-map-kicker text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Store</p>
                  <h3 className="store-map-title text-lg font-semibold text-slate-900">{activeStore.name}</h3>
                  <p className="store-map-subtitle text-sm text-slate-600">{activeStore.area}</p>
                </div>
                {mapSrc ? (
                  <a
                    href={mapSrc.googleSearchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-map-open-link"
                  >
                    Open Map
                  </a>
                ) : null}
              </div>

              <div className="store-map-frame h-[360px] md:h-[500px] overflow-hidden rounded-b-2xl lg:h-[538px]">
                {mapFailed || !mapSrc ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                    <p className="text-sm font-semibold text-slate-800">Map preview is unavailable on this network.</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <a
                        href={mapSrc?.googleMapsLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                      >
                        Open in Google Maps
                      </a>
                      <a
                        href={mapSrc?.osmLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Open in OpenStreetMap
                      </a>
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={`google-${mapSrc.embed}`}
                    title="Store location map"
                    src={mapSrc.embed}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={() => setMapFailed(true)}
                  />
                )}
              </div>
            </>
          ) : null}
        </section>
      </div>

      <style jsx>{`
        .store-layout {
          align-items: start;
          margin-top: 0.25rem;
        }

        .store-list-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .store-meta-line {
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .store-search-wrap {
          border: 1px solid #e2e8f0;
          background: linear-gradient(180deg, #ffffff, #f8fafc);
          border-radius: 14px;
          padding: 0.68rem;
        }

        .store-search-head {
          min-height: 22px;
        }

        .store-search-field {
          position: relative;
        }

        .store-search-control {
          min-height: 44px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0 0.65rem 0 0.7rem;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .store-search-control:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .store-search-input {
          font-size: 0.95rem;
          line-height: 1.35;
          flex: 1;
        }

        .store-search-icon {
          color: #64748b;
          margin-left: 0.05rem;
        }

        .store-search-clear {
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1;
        }

        .store-scroll {
          scrollbar-width: thin;
          scrollbar-color: #bfdbfe #f1f5f9;
          min-height: 0;
        }

        .store-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .store-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 999px;
        }

        .store-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #93c5fd, #60a5fa);
          border-radius: 999px;
        }

        .store-card {
          min-height: 208px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
          border-radius: 14px;
          padding: 0.85rem 0.95rem;
        }

        .store-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
        }

        .store-card-title {
          line-height: 1.25;
          letter-spacing: -0.01em;
          font-size: 1.08rem;
          margin-bottom: 0.1rem;
        }

        .store-card-area {
          font-size: 0.96rem;
          line-height: 1.35;
        }

        .store-card-badge {
          white-space: nowrap;
          align-self: start;
          letter-spacing: 0.01em;
        }

        .store-card-row {
          line-height: 1.45;
          font-size: 0.94rem;
        }

        .store-phone-link {
          font-size: 1rem;
          letter-spacing: 0.01em;
        }

        .store-card-body {
          border-top: 1px solid #e2e8f0;
          padding-top: 0.65rem;
          margin-top: 0.62rem;
        }

        .store-card-actions {
          border-top: 1px solid #e2e8f0;
          padding-top: 0.62rem;
          margin-top: 0.62rem;
          align-items: stretch;
        }

        .store-action-btn {
          min-height: 40px;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .store-action-btn-icon {
          min-width: 40px;
        }

        .store-map-panel {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .store-map-head {
          min-height: 90px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          background: linear-gradient(180deg, #ffffff, #f8fafc);
        }

        .store-map-head-copy {
          min-width: 0;
          flex: 1;
          display: grid;
          gap: 0.18rem;
        }

        .store-map-kicker {
          letter-spacing: 0.08em;
          line-height: 1.15;
        }

        .store-map-title {
          line-height: 1.18;
          letter-spacing: -0.01em;
          margin: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .store-map-subtitle {
          line-height: 1.35;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .store-map-open-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .store-map-open-link:hover {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        @media (max-width: 1024px) {
          .store-list-panel,
          .store-map-panel {
            height: auto;
          }

          .store-map-frame {
            height: 430px;
          }

          .store-scroll {
            max-height: 52vh !important;
          }

          .store-card {
            min-height: 190px;
          }

          .store-search-wrap {
            padding: 0.62rem;
          }

          .store-search-control {
            min-height: 42px;
          }

          .store-card-title {
            font-size: 1.02rem;
          }

          .store-card-area,
          .store-card-row {
            font-size: 0.91rem;
          }
        }

        @media (max-width: 640px) {
          .store-map-head {
            min-height: 82px;
            gap: 0.45rem;
            align-items: flex-start;
          }

          .store-map-title {
            font-size: 1.05rem;
          }

          .store-map-open-link {
            min-height: 30px;
            padding: 0.25rem 0.58rem;
            font-size: 0.72rem;
          }

          .store-search-head {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .store-meta-line {
            white-space: normal;
          }

          .store-card-actions {
            grid-template-columns: 1fr 1fr;
          }

          .store-action-btn {
            width: 100%;
          }

          .store-action-btn-icon {
            grid-column: span 2;
          }

          .store-scroll {
            max-height: 46vh !important;
          }

          .store-map-frame {
            height: 320px;
          }
        }
      `}</style>
    </section>
  );
}
