import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Fetch order with addresses and customer details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        pickupAddress: { include: { area: { include: { city: true } } } },
        dropAddress: { include: { area: { include: { city: true } } } },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Authorization: Only the customer who placed the order or ADMIN/MANAGER can access
    const isCustomer = order.customerId === session.user.id;
    const isStaff = ["ADMIN", "MANAGER"].includes(session.user.role);
    if (!isCustomer && !isStaff) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Create a PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF data into a Buffer
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    
    // Wait for the document to finish streaming
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", (err) => {
        reject(err);
      });

      // --- PDF Structure and Design ---
      
      // Header Banner Background
      doc.rect(0, 0, 612, 100).fill("#1e293b"); // dark slate header background
      
      doc.fillColor("#ffffff")
         .fontSize(22)
         .font("Helvetica-Bold")
         .text("LAST-MILE LOGISTICS", 50, 30, { align: "left" });
      
      doc.fontSize(10)
         .font("Helvetica")
         .text("Tax Invoice & Delivery Receipt", 50, 65, { align: "left" });

      doc.fillColor("#475569"); // resets text color
      
      // Invoice Meta info (placed in top right)
      doc.fillColor("#ffffff")
         .fontSize(9)
         .text(`Invoice No: ${order.orderNumber}`, 350, 35, { align: "right" })
         .text(`Date: ${order.createdAt.toLocaleDateString("en-IN")}`, 350, 50, { align: "right" })
         .text(`Payment Status: ${order.paymentStatus}`, 350, 65, { align: "right" });
      
      // Reset text options
      doc.fillColor("#0f172a");

      // Spacing below banner
      doc.moveDown(4);

      // Section 1: Customer Details
      doc.fontSize(12).font("Helvetica-Bold").text("Billed To:");
      doc.fontSize(10).font("Helvetica")
         .text(`Name: ${order.customer.name}`)
         .text(`Email: ${order.customer.email}`)
         .text(`Phone: ${order.customer.phone || "N/A"}`);
      
      doc.moveDown(1.5);

      // Section 2: Address Information
      doc.fontSize(12).font("Helvetica-Bold").text("Shipment Details:");
      
      const pickupStr = [
        order.pickupAddress.line1,
        order.pickupAddress.line2,
        order.pickupAddress.area.name,
        order.pickupAddress.cityName || order.pickupAddress.area.city.name,
        order.pickupAddress.stateCode,
        order.pickupAddress.countryCode,
        order.pickupAddress.postalCode
      ].filter(Boolean).join(", ");

      const dropStr = [
        order.dropAddress.line1,
        order.dropAddress.line2,
        order.dropAddress.area.name,
        order.dropAddress.cityName || order.dropAddress.area.city.name,
        order.dropAddress.stateCode,
        order.dropAddress.countryCode,
        order.dropAddress.postalCode
      ].filter(Boolean).join(", ");

      doc.fontSize(10).font("Helvetica")
         .text(`Pickup Address: ${pickupStr}`, { width: 500 })
         .moveDown(0.5)
         .text(`Drop Address: ${dropStr}`, { width: 500 })
         .moveDown(0.5)
         .text(`Route Type: ${order.routeType.replace("_", " ")}`)
         .text(`Billable Weight: ${Number(order.billableWeightKg)} kg`);

      doc.moveDown(2);

      // Section 3: Billing Table
      doc.fontSize(12).font("Helvetica-Bold").text("Billing Summary:");
      doc.moveDown(0.5);

      // Draw table borders and rows
      const tableTop = doc.y;
      doc.rect(50, tableTop, 512, 20).fill("#f1f5f9"); // header background
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(10);
      doc.text("Description", 60, tableTop + 5);
      doc.text("Amount", 450, tableTop + 5, { width: 100, align: "right" });

      let currentY = tableTop + 20;
      doc.font("Helvetica").fontSize(10);

      // Item 1: Base Delivery Charge
      doc.rect(50, currentY, 512, 20).stroke("#e2e8f0");
      doc.text("Base Delivery Charge (distance & volumetric weight)", 60, currentY + 5);
      doc.text(`INR ${Number(order.baseCharge).toFixed(2)}`, 450, currentY + 5, { width: 100, align: "right" });
      currentY += 20;

      // Item 2: COD Surcharge
      if (Number(order.codSurcharge) > 0) {
        doc.rect(50, currentY, 512, 20).stroke("#e2e8f0");
        doc.text("Cash on Delivery (COD) Surcharge", 60, currentY + 5);
        doc.text(`INR ${Number(order.codSurcharge).toFixed(2)}`, 450, currentY + 5, { width: 100, align: "right" });
        currentY += 20;
      }

      // Total Row
      doc.rect(50, currentY, 512, 25).fill("#f8fafc").stroke("#cbd5e1");
      doc.fillColor("#0f172a").font("Helvetica-Bold");
      doc.text("Total Paid / Due Amount", 60, currentY + 7);
      doc.text(`INR ${Number(order.totalCharge).toFixed(2)}`, 450, currentY + 7, { width: 100, align: "right" });

      doc.moveDown(3);

      // Footer disclaimer
      doc.fillColor("#64748b").font("Helvetica-Oblique").fontSize(9)
         .text("Thank you for choosing Last-Mile Logistics. This is a computer-generated invoice and requires no physical signature.", 50, doc.y, { align: "center", width: 512 });

      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.orderNumber}.pdf`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("Invoice generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
