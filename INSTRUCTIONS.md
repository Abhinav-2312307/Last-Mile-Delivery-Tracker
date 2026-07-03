# Evaluator Walkthrough & Testing Scenarios

This document outlines the step-by-step testing scenarios designed to show off the key capabilities of the Last-Mile Delivery Tracker. Use the tester accounts listed below to complete the flows.

---

## 🔑 Tester Accounts Cheat Sheet

| Role | Email | Password | Role Purpose |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@lastmile.test` | `Customer@12345` | Place orders and pay. |
| **Manager** | `manager@lastmile.test` | `Manager@12345` | Dispatch/assign orders to agents. |
| **Agent** | `agent.delhi@lastmile.test` | `Agent@12345` | Handle pick-up and delivery. |
| **Admin** | `admin@lastmile.test` | `Admin@12345` | Manage configurations & view stats. |

---

## 🚦 Step-by-Step Testing Walkthrough

### Scenario 1: Booking a Parcel (Customer Flow)
1. Navigate to the login page (`/login`) and log in using the **Customer** credentials:
   - **Email**: `customer@lastmile.test`
   - **Password**: `Customer@12345`
2. Click on **Book New Order** from the sidebar or dashboard.
3. Fill out the order form:
   - Select **Order Type** (B2C or B2B) and **Payment Type** (COD or Prepaid).
   - Enter pickup and drop-off addresses. Note how the **Pricing Estimate** dynamically updates on the right side of the screen when weight and dimensions are typed in.
4. If **Prepaid** was chosen, clicking submit will launch the **Razorpay Checkout Overlay** in test mode:
   - Use any test card numbers or mock credentials provided by the overlay.
   - Complete the mock payment to proceed.
5. If **COD** was chosen, the order is submitted immediately.
6. Copy the generated **Reference ID** (e.g. `LM-XXXXXX`) from your success screen or order history.

---

### Scenario 2: Assigning a Courier (Manager Flow)
1. Logout of the customer portal and navigate to `/login`. Log in using the **Manager** credentials:
   - **Email**: `manager@lastmile.test`
   - **Password**: `Manager@12345`
2. Go to the **Dispatch Console**.
3. Locate the order you created in Scenario 1.
4. Click **Assign Agent**. Select **Luffy** (the Delhi agent) or any available local agent from the drop-down menu and confirm.
5. The order status changes to `ASSIGNED`.

---

### Scenario 3: Pick-up and Delivery (Agent Flow)
1. Logout of the manager console. Log in using the **Agent** credentials:
   - **Email**: `agent.delhi@lastmile.test`
   - **Password**: `Agent@12345`
2. Go to the **Active Deliveries** section.
3. You will see the assigned order from Scenario 2.
4. Click **Mark Picked Up** (changes status to `PICKED_UP`).
5. Click **In Transit** (changes status to `IN_TRANSIT`).
6. Click **Out For Delivery** (changes status to `OUT_FOR_DELIVERY`).
7. Finally, click **Mark Delivered** (changes status to `DELIVERED`).

---

### Scenario 4: Guest Tracking & Admin Controls
1. Go to the main landing page (`/`).
2. Paste the **Reference ID** (e.g., `LM-XXXXXX`) from Scenario 1 into the tracking search bar and click **Track Package**.
3. You will see a detailed real-time tracking timeline containing all transitions:
   - When the order was created
   - When it was assigned by the manager
   - Every status update completed by the delivery agent (complete with exact timestamps).
4. Log in as the **Admin** (`admin@lastmile.test` / `Admin@12345`) to view the overall system dashboard displaying total revenue, active agents count, pending approvals, and options to modify rate cards.
