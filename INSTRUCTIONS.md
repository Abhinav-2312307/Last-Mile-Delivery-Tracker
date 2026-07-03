# Evaluator Walkthrough & Testing Scenarios

This document outlines the step-by-step testing scenarios designed to show off the key capabilities of the Last-Mile Delivery Tracker.

---

## 🔑 Core Tester Accounts

| Role | Email | Password | Role Purpose |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@lastmile.test` | `Customer@12345` | Place orders and pay. |
| **Manager** | `manager@lastmile.test` | `Manager@12345` | Dispatch/assign orders to agents. |
| **Admin** | `admin@lastmile.test` | `Admin@12345` | Manage configurations & view stats. |

---

## 📍 50 Major Cities Agent Accounts

We have pre-seeded agent accounts for **50 major cities across India**. You can log in as any of these agents to manage deliveries in their respective cities.

* **Password for all Agent Accounts:** `Agent@12345`
* **Agent Email Format:** `agent.<cityname_lowercase>@lastmile.test` (remove spaces/hyphens from city name)

### Examples of Agent Accounts:
1. **Kanpur Agent**: `agent.kanpur@lastmile.test`
2. **Lucknow Agent**: `agent.lucknow@lastmile.test`
3. **Bengaluru Agent**: `agent.bengaluru@lastmile.test`
4. **Patna Agent**: `agent.patna@lastmile.test`
5. **Pune Agent**: `agent.pune@lastmile.test`
6. **Hyderabad Agent**: `agent.hyderabad@lastmile.test`
7. **Ahmedabad Agent**: `agent.ahmedabad@lastmile.test`
8. **Chennai Agent**: `agent.chennai@lastmile.test`
9. **Kolkata Agent**: `agent.kolkata@lastmile.test`
*(And 41 other major cities seeded in the database. See the full list in the README)*

---

## 🚦 Step-by-Step Testing Walkthroughs

### Scenario 1: Local Booking & Auto-Assignment (Kanpur to Lucknow)
This scenario demonstrates how the system dynamically handles deliveries between arbitrary locations and automatically routes them to the nearest delivery agent/station.

1. **Book the Order (Customer)**:
   - Log in to `/login` using the Customer account: `customer@lastmile.test` / `Customer@12345`.
   - Go to **Book New Order**.
   - Set **Pickup Address** in **Kanpur** (select area `Kanpur Central`) and **Delivery Address** in **Lucknow** (select area `Lucknow Central`).
   - Notice that the distance and volumetric weight calculations automatically compute the pricing.
   - Choose **COD** or **Prepaid** and submit. Copy the reference `LM-XXXXXX`.
2. **Auto-Assign to Nearest Agent (Manager)**:
   - Log in to `/login` as the Manager: `manager@lastmile.test` / `Manager@12345`.
   - Navigate to the **Dispatch Console** and find the new order.
   - Click the **Auto** assign button next to the order.
   - The engine automatically calculates the distance from the order's pickup coordinates (Kanpur) to all active agents. Since `agent.kanpur` is right at the pickup center (0 km away) while other agents are in Lucknow (70 km away) or Delhi (400 km away), it automatically assigns the order to **Kanpur Agent**.
3. **Delivery Dispatch (Agent)**:
   - Log in to `/login` using the Kanpur Agent account: `agent.kanpur@lastmile.test` / `Agent@12345`.
   - You will see the assignment immediately reflected on your dashboard.
   - Update the status sequence (`PICKED_UP` ➔ `IN_TRANSIT` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).

---

### Scenario 2: Public Tracking Verification
1. Logout of all portals and go to the home landing page (`/`).
2. Paste the **Reference ID** (e.g. `LM-XXXXXX`) into the tracking search bar and click **Track Package**.
3. The tracking details will render an audit timeline showing:
   - Order confirmation
   - Auto-assignment by manager to the Kanpur agent
   - Exact timestamps for pickup, transit, and delivery events updated by the agent.
