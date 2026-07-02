"use client";

import { City as CSCity, Country, State } from "country-state-city";
import { useMemo, useState } from "react";

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
  dropCountryCode: string;
  dropStateCode: string;
  dropCityName: string;
  dropAreaId: string;
  dropLine1: string;
  dropLine2: string;
  dropPostalCode: string;
  dropContactName: string;
  dropContactPhone: string;
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

  const quote = useMemo(() => {
    if (!pickup || !drop) return null;
    try {
      return calculateDeliveryCharge({
        ...values,
        pickupZoneId: pickup.zoneId,
        dropZoneId: drop.zoneId,
        pickupCountryCode: values.pickupCountryCode,
        dropCountryCode: values.dropCountryCode,
        rateCards,
        internationalRateCards,
        codSurcharges,
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
  ]);

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
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? "";
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
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
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? "";
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
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
        (next[`${prefix}AreaId` as keyof FormValues] as string) = area?.id ?? "";
        (next[`${prefix}PostalCode` as keyof FormValues] as string) =
          area?.pincode ?? "";
      }

      if (field === "AreaId") {
        const area = areas.find((candidate) => candidate.id === value);
        if (area?.pincode) {
          (next[`${prefix}PostalCode` as keyof FormValues] as string) =
            area.pincode;
        }
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
    <form action={createOrder} className="order-wizard">
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
          <button className="button button-primary" disabled={!quote}>
            Confirm order
          </button>
        )}
      </div>
    </form>
  );
}

function AddressStep({
  prefix,
  title,
  areas,
  values,
  update,
  updateLocation,
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
            <option value="">Select a serviceable area</option>
            {serviceAreas.map((area) => (
              <option key={area.id} value={area.id}>{area.name} ({area.zoneName})</option>
            ))}
          </select>
          {cityName && serviceAreas.length === 0 && (
            <small className="form-error">This city is not serviceable yet.</small>
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
          Postal code
          <input value={get("PostalCode")} onChange={(event) => update(`${prefix}PostalCode` as keyof FormValues, event.target.value as never)} autoComplete="postal-code" />
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
      <p>{area?.name}, {get("CityName")}, {state}, {country} {get("PostalCode")}</p>
      <small>{get("ContactName")} · {get("ContactPhone")}</small>
    </article>
  );
}
