import { createRateCard, updateCodSurcharge } from "@/app/(dashboard)/admin/actions";
import { prisma } from "@/lib/db";

export default async function RatesPage() {
  const [rates, fees] = await Promise.all([
    prisma.rateCard.findMany({ orderBy: [{ orderType: "asc" }, { routeType: "asc" }] }),
    prisma.codSurcharge.findMany({ orderBy: { orderType: "asc" } }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Commercial configuration</p><h1>Rate cards</h1><p>Rates apply to the greater of actual and volumetric weight.</p></div></div>
      <section className="split-section">
        <form action={createRateCard} className="data-section form-stack"><div className="section-title"><h2>Add rate card</h2></div><label>Name<input name="name" required /></label><div className="form-grid two-column"><label>Order type<select name="orderType"><option>B2C</option><option>B2B</option></select></label><label>Route<select name="routeType"><option>INTRA_ZONE</option><option>INTER_ZONE</option></select></label><label>Price / kg<input name="pricePerKg" type="number" step="0.01" required /></label><label>Minimum charge<input name="minimumCharge" type="number" step="0.01" required /></label></div><button className="button button-primary">Add rate</button></form>
        <article className="data-section"><div className="section-title"><div><h2>COD surcharge</h2><p>Flat fee by order type</p></div></div>{["B2C", "B2B"].map((type) => <form action={updateCodSurcharge} className="inline-form" key={type}><input type="hidden" name="orderType" value={type} /><strong>{type}</strong><input aria-label={`${type} COD fee`} name="amount" type="number" step="0.01" defaultValue={Number(fees.find((fee) => fee.orderType === type)?.amount ?? 0)} /><button className="button button-small">Save</button></form>)}</article>
      </section>
      <section className="data-section"><div className="table-wrap"><table><thead><tr><th>Name</th><th>Order type</th><th>Route</th><th>Per kg</th><th>Minimum</th><th>Active</th></tr></thead><tbody>{rates.map((rate) => <tr key={rate.id}><td><strong>{rate.name}</strong></td><td>{rate.orderType}</td><td>{rate.routeType.replace("_", " ")}</td><td>₹{Number(rate.pricePerKg).toFixed(2)}</td><td>₹{Number(rate.minimumCharge).toFixed(2)}</td><td>{rate.isActive ? "Yes" : "No"}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
