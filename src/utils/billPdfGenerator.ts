import { jsPDF } from 'jspdf';
import { OrderDetails } from '../types';

/**
 * Generates an official Tax Invoice & Bill PDF for Ollywood Food Café.
 * Can be downloaded directly as a Blob or triggered as file download.
 */
export function generateBillPdf(order: OrderDetails): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 is standard restaurant receipt / bill format (148 x 210 mm)
  });

  const pageWidth = 148;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Header Title
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('OLLIWOOD FOOD CAFÉ', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Dine-In Restaurant & Artisanal Kitchen', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Near Axis Bank, Ayodhya Nagar, Brahmapur, Odisha - 760008', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Phone: +91 90782 66680 | FSSAI Lic: 22023014000128', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Horizontal divider
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Bill & Order Metadata Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OFFICIAL TAX INVOICE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text(`Date: ${formattedDate} ${formattedTime}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.text(`Bill / Order Ref: ${order.orderId}`, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`TABLE: ${order.tableNumber}`, pageWidth - margin, y, { align: 'right' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.text(`Guest: ${order.customerName} (${order.customerPhone})`, margin, y);
  doc.text(`KOT Docket: #${order.kotNumber}`, pageWidth - margin, y, { align: 'right' });
  y += 6;

  // Table Column Headers
  doc.setFillColor(245, 243, 239);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEM DESCRIPTION', margin + 2, y + 4.2);
  doc.text('QTY', margin + 65, y + 4.2, { align: 'center' });
  doc.text('RATE (Rs.)', margin + 92, y + 4.2, { align: 'right' });
  doc.text('AMOUNT (Rs.)', pageWidth - margin - 2, y + 4.2, { align: 'right' });
  y += 8;

  // Order Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    // Truncate name if too long
    const displayName = item.name.length > 32 ? item.name.substring(0, 31) + '…' : item.name;
    
    doc.text(displayName, margin + 2, y);
    doc.text(String(item.quantity), margin + 65, y, { align: 'center' });
    doc.text(item.price.toFixed(2), margin + 92, y, { align: 'right' });
    doc.text(itemTotal, pageWidth - margin - 2, y, { align: 'right' });
    y += 5;
  });

  y += 2;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Calculations Summary Box
  const summaryX = margin + 55;
  doc.setFontSize(8);

  doc.text('Subtotal:', summaryX, y);
  doc.text(`Rs. ${order.subtotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  if (order.discount && order.discount > 0) {
    doc.text('Promotional Discount:', summaryX, y);
    doc.text(`- Rs. ${order.discount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
    y += 4;
  }

  const cgst = (order.taxes / 2).toFixed(2);
  const sgst = (order.taxes / 2).toFixed(2);

  doc.text('CGST (2.5%):', summaryX, y);
  doc.text(`Rs. ${cgst}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  doc.text('SGST (2.5%):', summaryX, y);
  doc.text(`Rs. ${sgst}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  // Grand Total Box
  doc.setFillColor(26, 26, 26);
  doc.rect(summaryX - 2, y, contentWidth - 53, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT:', summaryX + 2, y + 4.8);
  doc.text(`Rs. ${order.total.toFixed(2)}`, pageWidth - margin - 4, y + 4.8, { align: 'right' });
  y += 10;

  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  doc.text(`Payment Mode: ${order.paymentMethod} | Status: ${order.paymentStatus || 'Paid via Table UPI'}`, margin, y);
  y += 4;

  if (order.instructions) {
    doc.text(`Special Chef Instructions: "${order.instructions}"`, margin, y);
    y += 4;
  }

  y += 3;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Footer & Disclaimer
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('"The Taste That Everybody Loves To Taste"', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Thank you for dining with us! Computer-generated tax invoice & e-bill.', pageWidth / 2, y, { align: 'center' });
  y += 3.5;
  doc.text('GSTIN: 21ABCDE1234F1Z5 • Ollywood Food Café, Brahmapur', pageWidth / 2, y, { align: 'center' });

  return doc;
}

/**
 * Triggers direct browser download of the bill PDF
 */
export function downloadBillPdf(order: OrderDetails) {
  const doc = generateBillPdf(order);
  const cleanId = order.orderId.replace(/[^a-zA-Z0-9-_]/g, '');
  doc.save(`Ollywood-Bill-${cleanId}-Table-${order.tableNumber}.pdf`);
}
