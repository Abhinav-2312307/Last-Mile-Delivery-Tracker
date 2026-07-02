import { createArea, createZone } from "@/app/(dashboard)/admin/actions";
import { prisma } from "@/lib/db";

export default async function ZonesPage() {
  const [cities, zones] = await Promise.all([
    prisma.city.findMany({ include: { country: true }, orderBy: { name: "asc" } }),
    prisma.zone.findMany({ include: { city: true, areas: { orderBy: { name: "asc" } } }, orderBy: { code: "asc" } }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Configuration</p><h1>Zones and service areas</h1><p>Location hierarchy used for rates and agent coverage.</p></div></div>
      <section className="split-section">
        <form action={createZone} className="data-section form-stack"><div className="section-title"><h2>Add zone</h2></div><label>Name<input name="name" required /></label><label>Code<input name="code" required placeholder="DEL-EAST" /></label><label>City<select name="cityId">{cities.map((city) => <option value={city.id} key={city.id}>{city.name}, {city.country.isoCode}</option>)}</select></label><button className="button button-primary">Add zone</button></form>
        <form action={createArea} className="data-section form-stack"><div className="section-title"><h2>Add area</h2></div><label>Name<input name="name" required /></label><label>Pincode<input name="pincode" /></label><label>City<select name="cityId">{cities.map((city) => <option value={city.id} key={city.id}>{city.name}</option>)}</select></label><label>Zone<select name="zoneId">{zones.map((zone) => <option value={zone.id} key={zone.id}>{zone.code}</option>)}</select></label><div className="form-grid two-column"><label>Latitude<input name="latitude" type="number" step="0.000001" required /></label><label>Longitude<input name="longitude" type="number" step="0.000001" required /></label></div><button className="button button-primary">Add area</button></form>
      </section>
      <section className="data-section"><div className="section-title"><h2>Coverage directory</h2></div><div className="table-wrap"><table><thead><tr><th>Zone</th><th>Code</th><th>City</th><th>Areas</th></tr></thead><tbody>{zones.map((zone) => <tr key={zone.id}><td><strong>{zone.name}</strong></td><td>{zone.code}</td><td>{zone.city.name}</td><td>{zone.areas.map((area) => area.name).join(", ") || "No areas"}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
