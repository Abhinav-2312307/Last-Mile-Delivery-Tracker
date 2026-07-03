"use client";

import { City as CSCity, Country, State } from "country-state-city";
import { useMemo, useState, useEffect } from "react";
import { MapPin, Locate } from "lucide-react";

function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).L) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.body.appendChild(script);
  });
}
function isRedirectError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

import { createOrder } from "@/app/(dashboard)/customer/orders/actions";
import { PARCEL_LIMITS } from "@/lib/orders/order-input";
import {
  calculateDeliveryCharge,
  type InternationalRateCardInput,
  type RateCardInput,
} from "@/lib/pricing/rate-engine";

type AreaOption = {
  id: string;
  name: string;
  pincode: string | null;
  zoneId: string;
  zoneName: string;
  cityName: string;
  stateCode: string;
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

type RateOption = RateCardInput;

type AddressPrefix = "pickup" | "drop";

type FormValues = {
  pickupCountryCode: string;
  pickupStateCode: string;
  pickupCityName: string;
  pickupAreaId: string;
  pickupLine1: string;
  pickupLine2: string;
  pickupPostalCode: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropCountryCode: string;
  dropStateCode: string;
  dropCityName: string;
  dropAreaId: string;
  dropLine1: string;
  dropLine2: string;
  dropPostalCode: string;
  dropContactName: string;
  dropContactPhone: string;
  dropLatitude: number;
  dropLongitude: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  orderType: "B2B" | "B2C";
  paymentType: "PREPAID" | "COD";
};

function initialAddress(prefix: AddressPrefix, area?: AreaOption) {
  return {
    [`${prefix}CountryCode`]: area?.countryCode ?? "IN",
    [`${prefix}StateCode`]: area?.stateCode ?? "",
    [`${prefix}CityName`]: area?.cityName ?? "",
    [`${prefix}AreaId`]: area?.id ?? "",
    [`${prefix}Line1`]: "",
    [`${prefix}Line2`]: "",
    [`${prefix}PostalCode`]: area?.pincode ?? "",
    [`${prefix}ContactName`]: "",
    [`${prefix}ContactPhone`]: "",
    [`${prefix}Latitude`]: area?.latitude ?? 0,
    [`${prefix}Longitude`]: area?.longitude ?? 0,
  };
}

export function OrderForm({
  areas,
  rateCards,
  internationalRateCards,
  codSurcharges,
}: {
  areas: AreaOption[];
  rateCards: RateOption[];
  internationalRateCards: InternationalRateCardInput[];
  codSurcharges: { orderType: "B2B" | "B2C"; amount: number }[];
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<FormValues>({
    ...initialAddress("pickup", areas[0]),
    ...initialAddress("drop", areas[1] ?? areas[0]),
    lengthCm: 30,
    breadthCm: 20,
    heightCm: 15,
    actualWeightKg: 2,
    orderType: "B2C",
    paymentType: "PREPAID",
  } as FormValues);

  const pickup = areas.find((area) => area.id === values.pickupAreaId);
  const drop = areas.find((area) => area.id === values.dropAreaId);
  const international =
    values.pickupCountryCode !== values.dropCountryCode;

  const pickupCoords = useMemo(() => {
    if (values.pickupLatitude && values.pickupLongitude) {
      return { latitude: values.pickupLatitude, longitude: values.pickupLongitude };
    }
    if (pickup) {
      return { latitude: Number(pickup.latitude), longitude: Number(pickup.longitude) };
    }
    if (values.pickupAreaId === "custom") {
      const city = CSCity.getCitiesOfState(values.pickupCountryCode, values.pickupStateCode).find(
        (c) => c.name.toLowerCase() === values.pickupCityName.toLowerCase()
      );
      if (city?.latitude && city?.longitude) {
        return { latitude: parseFloat(city.latitude), longitude: parseFloat(city.longitude) };
      }
      const state = State.getStateByCodeAndCountry(values.pickupStateCode, values.pickupCountryCode);
      if (state?.latitude && state?.longitude) {
        return { latitude: parseFloat(state.latitude), longitude: parseFloat(state.longitude) };
      }
      const country = Country.getCountryByCode(values.pickupCountryCode);
      if (country?.latitude && country?.longitude) {
        return { latitude: parseFloat(country.latitude), longitude: parseFloat(country.longitude) };
      }
    }
    return null;
  }, [pickup, values.pickupAreaId, values.pickupCityName, values.pickupCountryCode, values.pickupStateCode, values.pickupLatitude, values.pickupLongitude]);

  const dropCoords = useMemo(() => {
    if (values.dropLatitude && values.dropLongitude) {
      return { latitude: values.dropLatitude, longitude: values.dropLongitude };
    }
    if (drop) {
      return { latitude: Number(drop.latitude), longitude: Number(drop.longitude) };
    }
    if (values.dropAreaId === "custom") {
      const city = CSCity.getCitiesOfState(values.dropCountryCode, values.dropStateCode).find(
        (c) => c.name.toLowerCase() === values.dropCityName.toLowerCase()
      );
      if (city?.latitude && city?.longitude) {
        return { latitude: parseFloat(city.latitude), longitude: parseFloat(city.longitude) };
      }
      const state = State.getStateByCodeAndCountry(values.dropStateCode, values.dropCountryCode);
      if (state?.latitude && state?.longitude) {
        return { latitude: parseFloat(state.latitude), longitude: parseFloat(state.longitude) };
      }
      const country = Country.getCountryByCode(values.dropCountryCode);
      if (country?.latitude && country?.longitude) {
        return { latitude: parseFloat(country.latitude), longitude: parseFloat(country.longitude) };
      }
    }
    return null;
  }, [drop, values.dropAreaId, values.dropCityName, values.dropCountryCode, values.dropStateCode, values.dropLatitude, values.dropLongitude]);

  const quote = useMemo(() => {
    const isCustom = values.pickupAreaId === "custom" || values.dropAreaId === "custom";
    if (!isCustom && (!pickup || !drop)) return null;
    if (isCustom && (!pickupCoords || !dropCoords)) return null;
    try {
      return calculateDeliveryCharge({
        ...values,
        pickupZoneId: pickup?.zoneId ?? "custom",
        dropZoneId: drop?.zoneId ?? "custom",
        pickupCountryCode: values.pickupCountryCode,
        dropCountryCode: values.dropCountryCode,
        rateCards,
        internationalRateCards,
        codSurcharges,
        pickupLatitude: pickupCoords?.latitude,
        pickupLongitude: pickupCoords?.longitude,
        dropLatitude: dropCoords?.latitude,
        dropLongitude: dropCoords?.longitude,
        isCustomRoute: isCustom,
      });
    } catch {
      return null;
    }
  }, [
    codSurcharges,
    drop,
    internationalRateCards,
    pickup,
    rateCards,
    values,
    pickupCoords,
    dropCoords,
  ]);

  // Location states
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapPrefix, setMapPrefix] = useState<AddressPrefix>("pickup");
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapSelectedAddress, setMapSelectedAddress] = useState("");
  const [mapAddressLoading, setMapAddressLoading] = useState(false);
  const [mapGeocodedData, setMapGeocodedData] = useState<any>(null);
  const [detectingPrefix, setDetectingPrefix] = useState<AddressPrefix | null>(null);
  const [fetchingPincodePrefix, setFetchingPincodePrefix] = useState<AddressPrefix | null>(null);

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  // reverse geocode coords using Nominatim
  async function reverseGeocode(lat: number, lng: number) {
    setMapAddressLoading(true);
    setMapSelectedAddress("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Last-Mile-Delivery-Tracker-App"
          }
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && data.display_name) {
        setMapSelectedAddress(data.display_name);
        setMapGeocodedData(data);
        return data;
      }
    } catch {
      setMapSelectedAddress(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setMapAddressLoading(false);
    }
    return null;
  }

  // Handle leaflet map initialization & updates
  useEffect(() => {
    if (!mapModalOpen) {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
      return;
    }

    let active = true;

    loadLeaflet().then(() => {
      if (!active) return;
      const L = (window as any).L;
      if (!L) return;

      const initialLat = mapCoords?.lat ?? 20.5937;
      const initialLng = mapCoords?.lng ?? 78.9629;

      const mapInstance = L.map("leaflet-map").setView([initialLat, initialLng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Create a draggable marker
      const markerInstance = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstance);
      
      setMap(mapInstance);
      setMarker(markerInstance);

      reverseGeocode(initialLat, initialLng);

      const handleMove = async (latlng: any) => {
        setMapCoords({ lat: latlng.lat, lng: latlng.lng });
        await reverseGeocode(latlng.lat, latlng.lng);
      };

      markerInstance.on("dragend", (e: any) => {
        handleMove(e.target.getLatLng());
      });

      mapInstance.on("click", (e: any) => {
        markerInstance.setLatLng(e.latlng);
        handleMove(e.latlng);
      });
    }).catch(console.error);

    return () => {
      active = false;
    };
  }, [mapModalOpen]);

  const confirmMapLocation = () => {
    if (!mapCoords) return;
    setValues((current) => {
      const next = { ...current } as FormValues;
      const prefix = mapPrefix;
      
      (next[`${prefix}Latitude` as keyof FormValues] as number) = mapCoords.lat;
      (next[`${prefix}Longitude` as keyof FormValues] as number) = mapCoords.lng;
      
      if (mapGeocodedData && mapGeocodedData.address) {
        const addr = mapGeocodedData.address;
        const countryCode = (addr.country_code || "in").toUpperCase();
        (next[`${prefix}CountryCode` as keyof FormValues] as string) = countryCode;
        
        const stateName = addr.state || addr.region || "";
        if (stateName) {
          const matchedState = State.getStatesOfCountry(countryCode).find(
            (s) => s.name.toLowerCase() === stateName.toLowerCase()
          );
          if (matchedState) {
            (next[`${prefix}StateCode` as keyof FormValues] as string) = matchedState.isoCode;
          }
        }
        
        const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "";
        if (cityName) {
          (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
        }
        
        const postCode = addr.postcode || "";
        if (postCode) {
          (next[`${prefix}PostalCode` as keyof FormValues] as string) = postCode;
        }
        
        const line1 = [addr.house_number, addr.road].filter(Boolean).join(", ");
        if (line1) {
          (next[`${prefix}Line1` as keyof FormValues] as string) = line1;
        }
        const line2 = [addr.suburb, addr.neighbourhood, addr.subdistrict].filter(Boolean).join(", ");
        if (line2) {
          (next[`${prefix}Line2` as keyof FormValues] as string) = line2;
        }
        
        const area = areas.find(
          (candidate) =>
            candidate.countryCode === countryCode &&
            candidate.stateCode === (next[`${prefix}StateCode` as keyof FormValues] as string) &&
            candidate.cityName === (next[`${prefix}CityName` as keyof FormValues] as string)
        );
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
      }
      
      return next;
    });
    setMapModalOpen(false);
  };

  const detectLocation = (prefix: AddressPrefix) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingPrefix(prefix);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "Last-Mile-Delivery-Tracker-App"
              }
            }
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          setValues((current) => {
            const next = { ...current } as FormValues;
            
            (next[`${prefix}Latitude` as keyof FormValues] as number) = latitude;
            (next[`${prefix}Longitude` as keyof FormValues] as number) = longitude;
            
            if (data && data.address) {
              const addr = data.address;
              const countryCode = (addr.country_code || "in").toUpperCase();
              (next[`${prefix}CountryCode` as keyof FormValues] as string) = countryCode;
              
              const stateName = addr.state || addr.region || "";
              if (stateName) {
                const matchedState = State.getStatesOfCountry(countryCode).find(
                  (s) => s.name.toLowerCase() === stateName.toLowerCase()
                );
                if (matchedState) {
                  (next[`${prefix}StateCode` as keyof FormValues] as string) = matchedState.isoCode;
                }
              }
              
              const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "";
              if (cityName) {
                (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
              }
              
              const postCode = addr.postcode || "";
              if (postCode) {
                (next[`${prefix}PostalCode` as keyof FormValues] as string) = postCode;
              }
              
              const line1 = [addr.house_number, addr.road].filter(Boolean).join(", ");
              if (line1) {
                (next[`${prefix}Line1` as keyof FormValues] as string) = line1;
              }
              const line2 = [addr.suburb, addr.neighbourhood, addr.subdistrict].filter(Boolean).join(", ");
              if (line2) {
                (next[`${prefix}Line2` as keyof FormValues] as string) = line2;
              }
              
              const area = areas.find(
                (candidate) =>
                  candidate.countryCode === countryCode &&
                  candidate.stateCode === (next[`${prefix}StateCode` as keyof FormValues] as string) &&
                  candidate.cityName === (next[`${prefix}CityName` as keyof FormValues] as string)
              );
              (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
            }
            return next;
          });
        } catch (err) {
          alert("Could not retrieve address details for your location. You can try pinning it on the map.");
        } finally {
          setDetectingPrefix(null);
        }
      },
      (error) => {
        alert(error.message || "Failed to detect location.");
        setDetectingPrefix(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePincodeLookup = async (prefix: AddressPrefix, pincode: string) => {
    const cleanPincode = pincode.trim();
    if (cleanPincode.length < 3) return;
    
    const countryCode = String(values[`${prefix}CountryCode` as keyof FormValues]);
    setFetchingPincodePrefix(prefix);
    
    try {
      let resolved = false;
      
      try {
        const res = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${cleanPincode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.places && data.places.length > 0) {
            const place = data.places[0];
            const stateName = place.state;
            const cityName = place["place name"];
            const lat = parseFloat(place.latitude);
            const lng = parseFloat(place.longitude);
            
            setValues((current) => {
              const next = { ...current } as FormValues;
              
              if (stateName) {
                const matchedState = State.getStatesOfCountry(countryCode).find(
                  (s) => s.name.toLowerCase() === stateName.toLowerCase()
                );
                if (matchedState) {
                  (next[`${prefix}StateCode` as keyof FormValues] as string) = matchedState.isoCode;
                }
              }
              if (cityName) {
                (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
              }
              if (lat && lng) {
                (next[`${prefix}Latitude` as keyof FormValues] as number) = lat;
                (next[`${prefix}Longitude` as keyof FormValues] as number) = lng;
              }
              
              const area = areas.find(
                (candidate) =>
                  candidate.countryCode === countryCode &&
                  candidate.stateCode === (next[`${prefix}StateCode` as keyof FormValues] as string) &&
                  candidate.cityName === (next[`${prefix}CityName` as keyof FormValues] as string)
              );
              (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
              
              return next;
            });
            resolved = true;
          }
        }
      } catch {}
      
      if (!resolved && countryCode === "IN") {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            const stateName = postOffice.State;
            const cityName = postOffice.District;
            
            setValues((current) => {
              const next = { ...current } as FormValues;
              
              if (stateName) {
                const matchedState = State.getStatesOfCountry(countryCode).find(
                  (s) => s.name.toLowerCase() === stateName.toLowerCase()
                );
                if (matchedState) {
                  (next[`${prefix}StateCode` as keyof FormValues] as string) = matchedState.isoCode;
                }
              }
              if (cityName) {
                (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
              }
              
              const area = areas.find(
                (candidate) =>
                  candidate.countryCode === countryCode &&
                  candidate.stateCode === (next[`${prefix}StateCode` as keyof FormValues] as string) &&
                  candidate.cityName === (next[`${prefix}CityName` as keyof FormValues] as string)
              );
              (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
              
              return next;
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingPincodePrefix(null);
    }
  };

  const triggerMapPin = (prefix: AddressPrefix) => {
    setMapPrefix(prefix);
    const currentLat = Number(values[`${prefix}Latitude` as keyof FormValues]) || 20.5937;
    const currentLng = Number(values[`${prefix}Longitude` as keyof FormValues]) || 78.9629;
    setMapCoords({ lat: currentLat, lng: currentLng });
    setMapModalOpen(true);
  };

  function update<K extends keyof FormValues>(name: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateLocation(
    prefix: AddressPrefix,
    field: "CountryCode" | "StateCode" | "CityName" | "AreaId",
    value: string,
  ) {
    setValues((current) => {
      const next = { ...current } as FormValues;
      const key = `${prefix}${field}` as keyof FormValues;
      (next[key] as string) = value;

      const setCoordsFromArea = (areaCandidate?: AreaOption) => {
        if (areaCandidate) {
          (next[`${prefix}Latitude` as keyof FormValues] as number) = areaCandidate.latitude;
          (next[`${prefix}Longitude` as keyof FormValues] as number) = areaCandidate.longitude;
        } else {
          const countryCodeVal = String(next[`${prefix}CountryCode` as keyof FormValues]);
          const stateCodeVal = String(next[`${prefix}StateCode` as keyof FormValues]);
          const cityNameVal = String(next[`${prefix}CityName` as keyof FormValues]);

          const city = CSCity.getCitiesOfState(countryCodeVal, stateCodeVal).find(
            (c) => c.name.toLowerCase() === cityNameVal.toLowerCase()
          );
          if (city?.latitude && city?.longitude) {
            (next[`${prefix}Latitude` as keyof FormValues] as number) = parseFloat(city.latitude);
            (next[`${prefix}Longitude` as keyof FormValues] as number) = parseFloat(city.longitude);
          } else {
            const state = State.getStateByCodeAndCountry(stateCodeVal, countryCodeVal);
            if (state?.latitude && state?.longitude) {
              (next[`${prefix}Latitude` as keyof FormValues] as number) = parseFloat(state.latitude);
              (next[`${prefix}Longitude` as keyof FormValues] as number) = parseFloat(state.longitude);
            } else {
              const country = Country.getCountryByCode(countryCodeVal);
              if (country?.latitude && country?.longitude) {
                (next[`${prefix}Latitude` as keyof FormValues] as number) = parseFloat(country.latitude);
                (next[`${prefix}Longitude` as keyof FormValues] as number) = parseFloat(country.longitude);
              }
            }
          }
        }
      };

      if (field === "CountryCode") {
        const stateCode = State.getStatesOfCountry(value)[0]?.isoCode ?? "";
        const cityName =
          CSCity.getCitiesOfState(value, stateCode)[0]?.name ?? "";
        const area = areas.find(
          (candidate) =>
            candidate.countryCode === value &&
            candidate.stateCode === stateCode &&
            candidate.cityName === cityName,
        );
        (next[`${prefix}StateCode` as keyof FormValues] as string) = stateCode;
        (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
        setCoordsFromArea(area);
      }

      if (field === "StateCode") {
        const countryCode = String(
          next[`${prefix}CountryCode` as keyof FormValues],
        );
        const cityName =
          CSCity.getCitiesOfState(countryCode, value)[0]?.name ?? "";
        const area = areas.find(
          (candidate) =>
            candidate.countryCode === countryCode &&
            candidate.stateCode === value &&
            candidate.cityName === cityName,
        );
        (next[`${prefix}CityName` as keyof FormValues] as string) = cityName;
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (cityName ? "custom" : "");
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
        setCoordsFromArea(area);
      }

      if (field === "CityName") {
        const countryCode = String(
          next[`${prefix}CountryCode` as keyof FormValues],
        );
        const stateCode = String(
          next[`${prefix}StateCode` as keyof FormValues],
        );
        const area = areas.find(
          (candidate) =>
            candidate.countryCode === countryCode &&
            candidate.stateCode === stateCode &&
            candidate.cityName === value,
        );
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? (value ? "custom" : "");
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
        setCoordsFromArea(area);
      }

      if (field === "AreaId") {
        const area = areas.find((candidate) => candidate.id === value);
        if (area?.pincode) {
          (next[`${prefix}PostalCode` as keyof FormValues] as string) =
            area.pincode;
        }
        setCoordsFromArea(area);
      }
      if (
        next.pickupCountryCode !== next.dropCountryCode &&
        next.paymentType === "COD"
      ) {
        next.paymentType = "PREPAID";
      }
      return next;
    });
  }

  const addressReady = (prefix: AddressPrefix) =>
    [
      "CountryCode",
      "StateCode",
      "CityName",
      "AreaId",
      "Line1",
      "PostalCode",
      "ContactName",
      "ContactPhone",
    ].every((field) =>
      String(values[`${prefix}${field}` as keyof FormValues]).trim(),
    );

  const parcelReady =
    values.lengthCm >= PARCEL_LIMITS.minimumDimensionCm &&
    values.lengthCm <= PARCEL_LIMITS.maximumDimensionCm &&
    values.breadthCm >= PARCEL_LIMITS.minimumDimensionCm &&
    values.breadthCm <= PARCEL_LIMITS.maximumDimensionCm &&
    values.heightCm >= PARCEL_LIMITS.minimumDimensionCm &&
    values.heightCm <= PARCEL_LIMITS.maximumDimensionCm &&
    values.actualWeightKg >= PARCEL_LIMITS.minimumWeightKg &&
    values.actualWeightKg <= PARCEL_LIMITS.maximumWeightKg;

  return (
    <>
      <form
      action={async (formData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          await createOrder(formData);
        } catch (err) {
          if (isRedirectError(err)) {
            throw err;
          }
          setIsSubmitting(false);
          alert(err instanceof Error ? err.message : "Failed to create order");
        }
      }}
      className="order-wizard"
    >
      {Object.entries(values).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={String(value)} />
      ))}

      <ol className="wizard-steps" aria-label="Booking progress">
        {["Pickup", "Delivery", "Parcel", "Review & Pay"].map((label, index) => (
          <li
            className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""}
            key={label}
          >
            <span>{step > index + 1 ? "✓" : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <AddressStep
          areas={areas}
          prefix="pickup"
          title="Where should we collect the parcel?"
          values={values}
          update={update}
          updateLocation={updateLocation}
          detectLocation={detectLocation}
          detecting={detectingPrefix === "pickup"}
          openMap={triggerMapPin}
          handlePincodeLookup={handlePincodeLookup}
          fetchingPincode={fetchingPincodePrefix === "pickup"}
        />
      )}
      {step === 2 && (
        <AddressStep
          areas={areas}
          prefix="drop"
          title="Where should we deliver it?"
          values={values}
          update={update}
          updateLocation={updateLocation}
          detectLocation={detectLocation}
          detecting={detectingPrefix === "drop"}
          openMap={triggerMapPin}
          handlePincodeLookup={handlePincodeLookup}
          fetchingPincode={fetchingPincodePrefix === "drop"}
        />
      )}
      {step === 3 && (
        <section className="form-section">
          <div className="section-heading">
            <span>3</span>
            <div>
              <h2>Parcel and service</h2>
              <p>Limits protect pricing and carrier handling.</p>
            </div>
          </div>
          <div className="form-grid four-column">
            {[
              ["lengthCm", "Length (cm)", PARCEL_LIMITS.maximumDimensionCm],
              ["breadthCm", "Breadth (cm)", PARCEL_LIMITS.maximumDimensionCm],
              ["heightCm", "Height (cm)", PARCEL_LIMITS.maximumDimensionCm],
              ["actualWeightKg", "Actual weight (kg)", PARCEL_LIMITS.maximumWeightKg],
            ].map(([name, label, max]) => (
              <label key={String(name)}>
                {label}
                <input
                  max={Number(max)}
                  min="0.1"
                  step="0.1"
                  type="number"
                  value={values[name as keyof FormValues]}
                  onChange={(event) =>
                    update(name as keyof FormValues, Number(event.target.value) as never)
                  }
                />
                <small>Maximum {max} {name === "actualWeightKg" ? "kg" : "cm"}</small>
              </label>
            ))}
            <label>
              Order type
              <select
                value={values.orderType}
                onChange={(event) => update("orderType", event.target.value as "B2B" | "B2C")}
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </label>
            <label>
              Payment
              <select
                value={values.paymentType}
                onChange={(event) => update("paymentType", event.target.value as "PREPAID" | "COD")}
              >
                <option value="PREPAID">Prepaid (Razorpay)</option>
                {!international && <option value="COD">Cash on delivery</option>}
              </select>
              {international && <small>International orders must be prepaid.</small>}
            </label>
          </div>
        </section>
      )}
      {step === 4 && (
        <section className="form-section">
          <div className="section-heading">
            <span>4</span>
            <div>
              <h2>Review and confirm</h2>
              <p>Charges are recalculated securely on the server.</p>
            </div>
          </div>
          <div className="review-grid">
            <ReviewAddress title="Pickup" prefix="pickup" values={values} area={pickup} />
            <ReviewAddress title="Delivery" prefix="drop" values={values} area={drop} />
          </div>
          <aside className="quote-bar">
            {quote ? (
              <>
                <div><span>Route</span><strong>{quote.routeType.replaceAll("_", " ")}</strong></div>
                <div><span>Volumetric</span><strong>{quote.volumetricWeightKg} kg</strong></div>
                <div><span>Billable</span><strong>{quote.billableWeightKg} kg</strong></div>
                <div><span>Base</span><strong>₹{quote.baseCharge.toFixed(2)}</strong></div>
                <div><span>COD fee</span><strong>₹{quote.codSurcharge.toFixed(2)}</strong></div>
                <div className="quote-total"><span>Estimated total</span><strong>₹{quote.totalCharge.toFixed(2)}</strong></div>
              </>
            ) : (
              <p>No active rate is available for this route.</p>
            )}
          </aside>
        </section>
      )}

      <div className="wizard-actions">
        {step > 1 && (
          <button className="button button-secondary" type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            className="button button-primary"
            type="button"
            disabled={
              (step === 1 && !addressReady("pickup")) ||
              (step === 2 && !addressReady("drop")) ||
              (step === 3 && !parcelReady)
            }
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        ) : (
          <button className="button button-primary" disabled={!quote || isSubmitting}>
            {isSubmitting ? "Creating order..." : "Confirm order"}
          </button>
        )}
      </div>
    </form>
    {mapModalOpen && (
      <div className="map-modal-overlay">
        <div className="map-modal-content">
          <div className="map-modal-header">
            <h3>Pin your {mapPrefix} location</h3>
            <button type="button" className="map-modal-close-btn" onClick={() => setMapModalOpen(false)}>
              &times;
            </button>
          </div>
          <div className="map-modal-body">
            <div id="leaflet-map" style={{ height: "320px", width: "100%", borderRadius: "8px" }} />
            {mapAddressLoading ? (
              <p className="map-loading-text">Loading address details...</p>
            ) : mapSelectedAddress ? (
              <p className="map-address-summary">{mapSelectedAddress}</p>
            ) : null}
          </div>
          <div className="map-modal-footer">
            <button type="button" className="button button-secondary" onClick={() => setMapModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={confirmMapLocation}
              disabled={!mapCoords}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function AddressStep({
  prefix,
  title,
  areas,
  values,
  update,
  updateLocation,
  detectLocation,
  detecting,
  openMap,
  handlePincodeLookup,
  fetchingPincode,
}: {
  prefix: AddressPrefix;
  title: string;
  areas: AreaOption[];
  values: FormValues;
  update: <K extends keyof FormValues>(name: K, value: FormValues[K]) => void;
  updateLocation: (
    prefix: AddressPrefix,
    field: "CountryCode" | "StateCode" | "CityName" | "AreaId",
    value: string,
  ) => void;
  detectLocation: (prefix: AddressPrefix) => void;
  detecting: boolean;
  openMap: (prefix: AddressPrefix) => void;
  handlePincodeLookup: (prefix: AddressPrefix, pincode: string) => void;
  fetchingPincode: boolean;
}) {
  const get = (field: string) =>
    String(values[`${prefix}${field}` as keyof FormValues]);
  const countryCode = get("CountryCode");
  const stateCode = get("StateCode");
  const cityName = get("CityName");
  const states = State.getStatesOfCountry(countryCode);
  const directoryCities = CSCity.getCitiesOfState(countryCode, stateCode);
  const configuredCityNames = areas
    .filter(
      (area) =>
        area.countryCode === countryCode && area.stateCode === stateCode,
    )
    .map((area) => area.cityName);
  const cityNames = Array.from(
    new Set([...directoryCities.map((city) => city.name), ...configuredCityNames]),
  ).sort();
  const serviceAreas = areas.filter(
    (area) =>
      area.countryCode === countryCode &&
      area.stateCode === stateCode &&
      area.cityName === cityName,
  );

  return (
    <section className="form-section">
      <div className="section-heading">
        <span>{prefix === "pickup" ? 1 : 2}</span>
        <div><h2>{title}</h2><p>Select the location, then enter the exact postal address.</p></div>
      </div>
      <div className="location-controls-bar">
        <button
          type="button"
          className="button button-secondary button-small flex items-center gap-1"
          style={{ display: "inline-flex", minHeight: "32px", padding: "6px 12px" }}
          onClick={() => detectLocation(prefix)}
          disabled={detecting}
        >
          <Locate size={14} />
          {detecting ? "Detecting location..." : "Use Current Location"}
        </button>
        <button
          type="button"
          className="button button-secondary button-small flex items-center gap-1"
          style={{ display: "inline-flex", minHeight: "32px", padding: "6px 12px" }}
          onClick={() => openMap(prefix)}
        >
          <MapPin size={14} />
          Pin on Map
        </button>
      </div>
      <div className="form-grid two-column">
        <label>
          Country
          <select value={countryCode} onChange={(event) => updateLocation(prefix, "CountryCode", event.target.value)}>
            {Country.getAllCountries().map((country) => (
              <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
            ))}
          </select>
        </label>
        <label>
          State / UT
          <select value={stateCode} onChange={(event) => updateLocation(prefix, "StateCode", event.target.value)}>
            <option value="">Select state or territory</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
            ))}
          </select>
        </label>
        <label>
          City
          <select value={cityName} onChange={(event) => updateLocation(prefix, "CityName", event.target.value)}>
            <option value="">Select city</option>
            {cityNames.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          Service area
          <select value={get("AreaId")} onChange={(event) => updateLocation(prefix, "AreaId", event.target.value)}>
            {cityName && serviceAreas.length === 0 ? (
              <option value="custom">Standard Delivery Area (Custom Distance Pricing)</option>
            ) : (
              <>
                <option value="">Select a serviceable area</option>
                {serviceAreas.map((area) => (
                  <option key={area.id} value={area.id}>{area.name} ({area.zoneName})</option>
                ))}
              </>
            )}
          </select>
          {cityName && serviceAreas.length === 0 && (
            <small className="text-amber-600 block mt-1">This city will use distance-based pricing.</small>
          )}
        </label>
        <label>
          House / flat / building
          <input value={get("Line1")} onChange={(event) => update(`${prefix}Line1` as keyof FormValues, event.target.value as never)} placeholder="Flat 12B, Sunrise Tower" />
        </label>
        <label>
          Street, locality and landmark
          <input value={get("Line2")} onChange={(event) => update(`${prefix}Line2` as keyof FormValues, event.target.value as never)} placeholder="MG Road, near Metro Gate 2" />
        </label>
        <label>
          Postal code {fetchingPincode && <span className="text-muted text-xs animate-pulse">(fetching...)</span>}
          <input
            value={get("PostalCode")}
            onChange={(event) => update(`${prefix}PostalCode` as keyof FormValues, event.target.value as never)}
            onBlur={(event) => handlePincodeLookup(prefix, event.target.value)}
            autoComplete="postal-code"
          />
        </label>
        <label>
          Contact name
          <input value={get("ContactName")} onChange={(event) => update(`${prefix}ContactName` as keyof FormValues, event.target.value as never)} />
        </label>
        <label>
          Contact phone
          <input type="tel" value={get("ContactPhone")} onChange={(event) => update(`${prefix}ContactPhone` as keyof FormValues, event.target.value as never)} placeholder="+91 98765 43210" />
        </label>
      </div>
    </section>
  );
}

function ReviewAddress({
  title,
  prefix,
  values,
  area,
}: {
  title: string;
  prefix: AddressPrefix;
  values: FormValues;
  area?: AreaOption;
}) {
  const get = (field: string) =>
    String(values[`${prefix}${field}` as keyof FormValues]);
  const country = Country.getCountryByCode(get("CountryCode"))?.name;
  const state = State.getStateByCodeAndCountry(
    get("StateCode"),
    get("CountryCode"),
  )?.name;
  return (
    <article className="review-card">
      <h3>{title}</h3>
      <p>{get("Line1")}{get("Line2") ? `, ${get("Line2")}` : ""}</p>
      <p>{area?.name || "Standard Delivery Area"}, {get("CityName")}, {state}, {country} {get("PostalCode")}</p>
      <small>{get("ContactName")} · {get("ContactPhone")}</small>
    </article>
  );
}
