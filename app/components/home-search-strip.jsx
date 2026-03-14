"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LOCATION_CACHE_KEY = "Rudraksh_home_location_cache_v1";
const DEFAULT_SUGGESTION_IMAGE = "/products/default-medicine.svg";

function formatLocationLabel(payload, latitude, longitude) {
  const locality =
    payload?.locality
    || payload?.city
    || payload?.principalSubdivision
    || payload?.county
    || "";
  const state = payload?.principalSubdivision || payload?.region || "";

  if (locality && state && locality !== state) {
    return `${locality}, ${state}`;
  }

  if (locality || state) {
    return locality || state;
  }

  return `${Number(latitude).toFixed(2)}, ${Number(longitude).toFixed(2)}`;
}

function readLocationCache() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.label) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeLocationCache(payload) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // noop
  }
}

function getInitialLocationState() {
  return {
    label: "Detecting location...",
    locating: true,
  };
}

export function HomeSearchStrip() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLocationState = getInitialLocationState();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [locationLabel, setLocationLabel] = useState(initialLocationState.label);
  const [isLocating, setIsLocating] = useState(initialLocationState.locating);
  const formRef = useRef(null);
  const isProductsPage = pathname === "/products";

  const resolveReadableLocation = useCallback(async (latitude, longitude) => {
    const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;
    const response = await fetch(endpoint, { method: "GET" });
    if (!response.ok) {
      throw new Error("Unable to resolve location.");
    }

    const payload = await response.json();
    return formatLocationLabel(payload, latitude, longitude);
  }, []);

  const runLocationLookup = useCallback(async (forceRefresh = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationLabel("Location unavailable");
      setIsLocating(false);
      return;
    }

    const cached = readLocationCache();
    if (cached?.label && !forceRefresh) {
      setLocationLabel(cached.label);
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    if (forceRefresh || !cached?.label) {
      setLocationLabel("Detecting location...");
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000,
      });
    }).catch((error) => ({ error }));

    if (position?.error) {
      if (cached?.label) {
        setLocationLabel(cached.label);
      } else {
        setLocationLabel("Enable location");
      }
      setIsLocating(false);
      return;
    }

    const { latitude, longitude } = position.coords;

    try {
      const readableLabel = await resolveReadableLocation(latitude, longitude);
      setLocationLabel(readableLabel);
      writeLocationCache({
        label: readableLabel,
        latitude,
        longitude,
        savedAt: new Date().toISOString(),
      });
    } catch {
      const fallbackLabel = `${Number(latitude).toFixed(2)}, ${Number(longitude).toFixed(2)}`;
      setLocationLabel(fallbackLabel);
      writeLocationCache({
        label: fallbackLabel,
        latitude,
        longitude,
        savedAt: new Date().toISOString(),
      });
    }

    setIsLocating(false);
  }, [resolveReadableLocation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runLocationLookup(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [runLocationLookup]);

  const currentQueryParam = useMemo(
    () => searchParams?.get("q") || "",
    [searchParams]
  );

  useEffect(() => {
    setQuery(currentQueryParam);
  }, [currentQueryParam]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(-1);
      setIsLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          page: "1",
          limit: "8",
        });
        const response = await fetch(`/api/medicines?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions.");
        }

        const payload = await response.json();
        const products = Array.isArray(payload?.products) ? payload.products : [];
        setSuggestions(products.slice(0, 8));
        setIsSuggestionOpen(true);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
          setIsSuggestionOpen(false);
          setActiveSuggestionIndex(-1);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!isProductsPage) {
      return;
    }

    const value = query.trim();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const currentParams = new URLSearchParams(searchParams?.toString() || "");
      currentParams.delete("page");

      const nextUrl = params.toString() ? `/products?${params.toString()}` : "/products";
      const currentUrl = currentParams.toString() ? `/products?${currentParams.toString()}` : "/products";

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl, { scroll: false });
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [isProductsPage, query, router, searchParams]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion) => {
    const name = String(suggestion?.name || "").trim();
    const selectedQuery = name || query.trim();

    if (!selectedQuery) {
      return;
    }

    setQuery(selectedQuery);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(-1);
    router.push(`/products?q=${encodeURIComponent(selectedQuery)}`);
  }, [query, router]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      handleSuggestionSelect(suggestions[activeSuggestionIndex]);
      return;
    }

    const value = query.trim();
    if (!value) {
      return;
    }

    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(-1);
    router.push(`/products?q=${encodeURIComponent(value)}`);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (!isSuggestionOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      event.preventDefault();
      handleSuggestionSelect(suggestions[activeSuggestionIndex]);
    }
  };

  return (
    <section className="home-search-section" aria-label="Quick medicine search">
      <div className="container home-search-bar">
        <div className="home-search-left">
          <div className="home-search-location">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="home-search-icon">
              <path d="M12 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
            </svg>
            <strong>{locationLabel}</strong>
            <button
              type="button"
              className="home-location-refresh"
              aria-label="Refresh location"
              title="Refresh location"
              onClick={() => runLocationLookup(true)}
              disabled={isLocating}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-search-icon">
                <path d="M20 12a8 8 0 1 1-2.35-5.65" />
                <path d="M20 5v4h-4" />
              </svg>
            </button>
          </div>

          <form
            className="home-search-form"
            role="search"
            aria-label="Search medicines"
            onSubmit={handleSearch}
            ref={formRef}
          >
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (!isSuggestionOpen) {
                  setIsSuggestionOpen(true);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setIsSuggestionOpen(true);
                }
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search for Medicines and Health Products"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={isSuggestionOpen}
              aria-controls="medicine-suggestions-list"
            />
            <button type="submit" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-search-icon">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" />
              </svg>
            </button>

            {isSuggestionOpen && query.trim() && (
              <div className="home-search-suggestions" role="listbox" id="medicine-suggestions-list">
                {isLoadingSuggestions ? (
                  <p className="home-search-suggestion-empty">Searching medicines...</p>
                ) : suggestions.length === 0 ? (
                  <p className="home-search-suggestion-empty">No medicines found</p>
                ) : (
                  suggestions.map((item, index) => {
                    const key = item.id || item.srNo || `${item.name}-${index}`;
                    const isActive = index === activeSuggestionIndex;
                    const thumbnailSrc = typeof item?.image === "string" && item.image.trim()
                      ? item.image
                      : DEFAULT_SUGGESTION_IMAGE;

                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`home-search-suggestion-item${isActive ? " is-active" : ""}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionSelect(item)}
                      >
                        <span className="home-search-suggestion-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="home-search-suggestion-icon-svg">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3.5 2.2" />
                          </svg>
                        </span>
                        <span className="home-search-suggestion-name">{item.name}</span>
                        <span className="home-search-suggestion-thumb" aria-hidden="true">
                          <img src={thumbnailSrc} alt="" loading="lazy" decoding="async" />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </form>
        </div>

        <Link href="/quick-order" className="home-quick-order" target="_blank" rel="noopener noreferrer">
          <p>
            <span>Quick Buy!</span> Get <strong>Upto 20% off</strong> on medicines*
          </p>
          <span className="home-quick-order-btn">Quick order</span>
        </Link>
      </div>
    </section>
  );
}
