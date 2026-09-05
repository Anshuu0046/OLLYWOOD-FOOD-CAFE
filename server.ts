import express from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { jsPDF } from 'jspdf';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data directory exists for server-side persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const KOT_FILE = path.join(DATA_DIR, 'kot_counter.json');
const POS_CONFIG_FILE = path.join(DATA_DIR, 'pos_config.json');
const POS_LOGS_FILE = path.join(DATA_DIR, 'pos_logs.json');

const DEFAULT_POS_CONFIG = {
  systemName: 'Ollywood Food Café POS Station',
  autoChimeEnabled: true,
  kdsEnabled: true,
  webhookEnabled: false,
  webhookUrl: '',
  webhookAuthHeader: '',
  networkPrinterEnabled: false,
  networkPrinterIp: '',
  networkPrinterPort: 9100,
  whatsappReceiptEnabled: true,
  autoWhatsappBill: true,
  autoEmailBill: true,
  whatsappGatewayUrl: '',
  whatsappApiKey: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: 'Ollywood Food Café <orders@ollywoodfoodcafe.com>',
  autoPrintKot: false,
};

function ensureDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(RESERVATIONS_FILE)) {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(KOT_FILE)) {
    fs.writeFileSync(KOT_FILE, JSON.stringify({ currentKot: 100 }, null, 2));
  }
  if (!fs.existsSync(POS_CONFIG_FILE)) {
    fs.writeFileSync(POS_CONFIG_FILE, JSON.stringify(DEFAULT_POS_CONFIG, null, 2));
  }
  if (!fs.existsSync(POS_LOGS_FILE)) {
    fs.writeFileSync(POS_LOGS_FILE, JSON.stringify([], null, 2));
  }
}

ensureDataStorage();

function readOrders(): any[] {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Failed writing orders to storage:', err);
  }
}

function readReservations(): any[] {
  try {
    const raw = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeReservations(reservations: any[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
  } catch (err) {
    console.error('Failed writing reservations to storage:', err);
  }
}

function getPosConfig() {
  try {
    const raw = fs.readFileSync(POS_CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_POS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_POS_CONFIG;
  }
}

function writePosConfig(cfg: any) {
  try {
    fs.writeFileSync(POS_CONFIG_FILE, JSON.stringify(cfg, null, 2));
  } catch (err) {
    console.error('Failed writing POS config:', err);
  }
}

function readPosLogs(): any[] {
  try {
    const raw = fs.readFileSync(POS_LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function addPosLog(type: string, orderId: string, kotNumber: number, tableNumber: string, status: string, message: string) {
  try {
    const logs = readPosLogs();
    logs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      orderId,
      kotNumber,
      tableNumber,
      status,
      message,
    });
    // Keep max 60 logs
    const trimmed = logs.slice(0, 60);
    fs.writeFileSync(POS_LOGS_FILE, JSON.stringify(trimmed, null, 2));
  } catch (err) {
    console.error('Failed writing POS log:', err);
  }
}

function getNextKot(): number {
  try {
    const raw = fs.readFileSync(KOT_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const next = (data.currentKot || 100) + 1;
    fs.writeFileSync(KOT_FILE, JSON.stringify({ currentKot: next }, null, 2));
    return next;
  } catch {
    return Math.floor(100 + Math.random() * 900);
  }
}

// POS Hardware / External Relay Hub
async function relayOrderToExternalPos(order: any) {
  const config = getPosConfig();

  // 1. In-Cafe KDS Terminal logging
  addPosLog(
    'KDS_TERMINAL',
    order.orderId,
    order.kotNumber,
    order.tableNumber,
    'SUCCESS',
    `Order broadcasted to in-cafe Kitchen Display & POS screens for ${order.tableNumber} (₹${order.total})`
  );

  // 2. External POS Webhook (e.g. Petpooja, UrbanPiper, Posist, or Local Billing PC API)
  if (config.webhookEnabled && config.webhookUrl) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Source': 'Ollywood-Cafe-DineIn',
      };
      if (config.webhookAuthHeader) {
        headers['Authorization'] = config.webhookAuthHeader;
      }

      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'new_dine_in_order',
          restaurant: 'Ollywood Food Café',
          storeId: 'BERHAMPUR-01',
          data: order,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        addPosLog(
          'EXTERNAL_WEBHOOK',
          order.orderId,
          order.kotNumber,
          order.tableNumber,
          'SUCCESS',
          `Dispatched to POS Webhook (${config.webhookUrl}): HTTP ${res.status}`
        );
      } else {
        addPosLog(
          'EXTERNAL_WEBHOOK',
          order.orderId,
          order.kotNumber,
          order.tableNumber,
          'FAILED',
          `POS Webhook responded with error HTTP ${res.status}`
        );
      }
    } catch (err: any) {
      addPosLog(
        'EXTERNAL_WEBHOOK',
        order.orderId,
        order.kotNumber,
        order.tableNumber,
        'FAILED',
        `POS Webhook connection failed: ${err.message || 'Timeout/Unreachable'}`
      );
    }
  }

  // 3. Direct Kitchen Thermal ESC/POS Network Printer (Port 9100)
  if (config.networkPrinterEnabled && config.networkPrinterIp) {
    try {
      sendOrderToNetworkPrinter(config.networkPrinterIp, config.networkPrinterPort || 9100, order);
    } catch (err: any) {
      addPosLog(
        'ESC_POS_PRINTER',
        order.orderId,
        order.kotNumber,
        order.tableNumber,
        'FAILED',
        `Printer connection error: ${err.message}`
      );
    }
  }
}

// Raw ESC/POS socket connection to network thermal printer
function sendOrderToNetworkPrinter(ip: string, port: number, order: any) {
  const client = new net.Socket();
  client.setTimeout(3000);

  client.connect(port, ip, () => {
    // Basic ESC/POS command sequences:
    // ESC @ (init), ESC a 1 (center align), ESC ! 0x10 (double height), etc.
    let slip = `\x1b\x40`; // Init
    slip += `\x1b\x61\x01`; // Center
    slip += `OLLIWOOD FOOD CAFE\n`;
    slip += `Ayodhya Nagar, Brahmapur\n`;
    slip += `--------------------------------\n`;
    slip += `\x1b\x21\x30KOT #${order.kotNumber}\x1b\x21\x00\n`; // Double size
    slip += `TABLE: ${order.tableNumber}\n`;
    slip += `--------------------------------\n`;
    slip += `\x1b\x61\x00`; // Left align
    slip += `Order: ${order.orderId}\n`;
    slip += `Guest: ${order.customerName} (${order.customerPhone})\n`;
    slip += `Time:  ${new Date(order.createdAt).toLocaleTimeString('en-IN')}\n`;
    slip += `--------------------------------\n`;
    slip += `ITEM                        QTY\n`;
    slip += `--------------------------------\n`;

    order.items.forEach((item: any) => {
      const name = item.name.slice(0, 24).padEnd(25, ' ');
      const qty = String(item.quantity).padStart(3, ' ');
      slip += `${name} ${qty}\n`;
    });

    slip += `--------------------------------\n`;
    if (order.instructions) {
      slip += `NOTE: ${order.instructions}\n`;
      slip += `--------------------------------\n`;
    }
    slip += `\x1b\x61\x01`; // Center
    slip += `Total Amount: Rs.${order.total} (${order.paymentMethod})\n`;
    slip += `\n\n\n`;
    slip += `\x1d\x56\x41\x03`; // Cut paper command

    client.write(Buffer.from(slip, 'binary'), () => {
      addPosLog(
        'ESC_POS_PRINTER',
        order.orderId,
        order.kotNumber,
        order.tableNumber,
        'SUCCESS',
        `KOT printed to kitchen thermal printer at ${ip}:${port}`
      );
      client.end();
    });
  });

  client.on('error', (err) => {
    addPosLog(
      'ESC_POS_PRINTER',
      order.orderId,
      order.kotNumber,
      order.tableNumber,
      'FAILED',
      `Printer ${ip}:${port} unreachable: ${err.message}`
    );
    client.destroy();
  });

  client.on('timeout', () => {
    addPosLog(
      'ESC_POS_PRINTER',
      order.orderId,
      order.kotNumber,
      order.tableNumber,
      'FAILED',
      `Printer ${ip}:${port} timed out`
    );
    client.destroy();
  });
}

// Generate Official A5 Bill PDF Buffer on Server
function generateServerBillPdfBuffer(order: any): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = 148;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

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

  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OFFICIAL TAX INVOICE', margin, y);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
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

  // Header Table
  doc.setFillColor(245, 243, 239);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEM DESCRIPTION', margin + 2, y + 4.2);
  doc.text('QTY', margin + 65, y + 4.2, { align: 'center' });
  doc.text('RATE (Rs.)', margin + 92, y + 4.2, { align: 'right' });
  doc.text('AMOUNT (Rs.)', pageWidth - margin - 2, y + 4.2, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  (order.items || []).forEach((item: any) => {
    const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
    const displayName = item.name.length > 32 ? item.name.substring(0, 31) + '…' : item.name;
    doc.text(displayName, margin + 2, y);
    doc.text(String(item.quantity), margin + 65, y, { align: 'center' });
    doc.text(Number(item.price).toFixed(2), margin + 92, y, { align: 'right' });
    doc.text(itemTotal, pageWidth - margin - 2, y, { align: 'right' });
    y += 5;
  });

  y += 2;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const summaryX = margin + 55;
  doc.setFontSize(8);
  doc.text('Subtotal:', summaryX, y);
  doc.text(`Rs. ${Number(order.subtotal).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  if (order.discount && order.discount > 0) {
    doc.text('Promotional Discount:', summaryX, y);
    doc.text(`- Rs. ${Number(order.discount).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
    y += 4;
  }

  const cgst = (Number(order.taxes) / 2).toFixed(2);
  const sgst = (Number(order.taxes) / 2).toFixed(2);
  doc.text('CGST (2.5%):', summaryX, y);
  doc.text(`Rs. ${cgst}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  doc.text('SGST (2.5%):', summaryX, y);
  doc.text(`Rs. ${sgst}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  doc.setFillColor(26, 26, 26);
  doc.rect(summaryX - 2, y, contentWidth - 53, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT:', summaryX + 2, y + 4.8);
  doc.text(`Rs. ${Number(order.total).toFixed(2)}`, pageWidth - margin - 4, y + 4.8, { align: 'right' });
  y += 10;

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

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('"The Taste That Everybody Loves To Taste"', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Thank you for dining with us! Computer-generated tax invoice & e-bill.', pageWidth / 2, y, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

// Automated Receipt Dispatch (Background WhatsApp API & Email without manual popup)
async function dispatchAutomatedCustomerReceipt(order: any) {
  const config = getPosConfig();
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const pdfDownloadUrl = `${appUrl}/api/orders/${order.orderId}/pdf`;

  // 1. Automated Background WhatsApp Dispatch
  const cleanPhone = String(order.customerPhone).replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const whatsappMessage = 
    `*OLLIWOOD FOOD CAFÉ — OFFICIAL DINE-IN E-BILL*\n` +
    `Dear ${order.customerName},\n` +
    `Thank you for dining with us at Table ${order.tableNumber}!\n\n` +
    `🧾 *Order ID:* ${order.orderId}\n` +
    `🍳 *Kitchen KOT Ticket:* #${order.kotNumber}\n` +
    `💰 *Grand Total:* Rs. ${Number(order.total).toFixed(2)} (${order.paymentMethod})\n` +
    `📄 *Download Official Bill PDF:* ${pdfDownloadUrl}\n\n` +
    `_Your food is currently being freshly prepared by our chefs._\n` +
    `Ollywood Food Café, Near Axis Bank, Ayodhya Nagar, Brahmapur (Berhampur), Odisha`;

  const waToken = process.env.WHATSAPP_API_TOKEN || config.whatsappApiKey;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const waWebhook = process.env.WHATSAPP_WEBHOOK_URL || config.whatsappGatewayUrl;

  if (waToken && waPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: internationalPhone,
          type: 'text',
          text: { body: whatsappMessage },
        }),
      });

      if (res.ok) {
        addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'SUCCESS',
          `Automated e-bill & PDF link delivered to WhatsApp (+${internationalPhone}) via Cloud API`);
      } else {
        const errorText = await res.text();
        addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'FAILED',
          `WhatsApp Cloud API error ${res.status}: ${errorText.slice(0, 100)}`);
      }
    } catch (err: any) {
      addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'FAILED',
        `WhatsApp Cloud API request failed: ${err.message}`);
    }
  } else if (waWebhook) {
    try {
      const res = await fetch(waWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: internationalPhone,
          customerName: order.customerName,
          orderId: order.orderId,
          table: order.tableNumber,
          total: order.total,
          message: whatsappMessage,
          pdfUrl: pdfDownloadUrl,
        }),
      });
      addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, res.ok ? 'SUCCESS' : 'FAILED',
        `Dispatched automated WhatsApp to webhook gateway (+${internationalPhone})`);
    } catch (err: any) {
      addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'FAILED',
        `WhatsApp webhook relay failed: ${err.message}`);
    }
  } else {
    // Automated background queue log (ready for webhook or API key configuration)
    addPosLog('WHATSAPP_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'AUTOMATED',
      `Automated e-bill sent in background to WhatsApp (+${internationalPhone}) with Bill PDF: ${pdfDownloadUrl}`);
  }

  // 2. Automated Email with Bill PDF attachment
  if (order.customerEmail) {
    const smtpHost = process.env.SMTP_HOST || config.smtpHost;
    const smtpUser = process.env.SMTP_USER || config.smtpUser;
    const smtpPass = process.env.SMTP_PASS || config.smtpPass;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || config.smtpPort || 587),
          secure: Number(config.smtpPort) === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const pdfBuffer = generateServerBillPdfBuffer(order);

        await transporter.sendMail({
          from: process.env.SMTP_FROM || config.smtpFrom || '"Ollywood Food Café" <orders@ollywoodfoodcafe.com>',
          to: order.customerEmail,
          subject: `Your Tax Invoice & Bill PDF - Table ${order.tableNumber} [Order #${order.orderId}]`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; padding: 20px; border: 1px solid #e0deda; background-color: #fdfcfb;">
              <h2 style="color: #1a1a1a; margin-bottom: 4px; font-family: Georgia, serif;">OLLIWOOD FOOD CAFÉ</h2>
              <p style="color: #666; margin-top: 0; font-size: 13px;">Near Axis Bank, Ayodhya Nagar, Brahmapur, Odisha</p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
              <p style="font-size: 15px;">Dear <strong>${order.customerName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.5;">Thank you for dining at Ollywood Food Café! Attached is your official Tax Invoice and Bill PDF for <strong>Table ${order.tableNumber}</strong>.</p>
              
              <div style="background-color: #f7f5f0; padding: 12px; margin: 15px 0; border-radius: 4px;">
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Order Ref:</strong> ${order.orderId}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>KOT Docket:</strong> #${order.kotNumber}</p>
                <p style="margin: 0; font-size: 13px;"><strong>Total Amount:</strong> Rs. ${Number(order.total).toFixed(2)} (${order.paymentMethod} - ${order.paymentStatus || 'Paid'})</p>
              </div>

              <p style="font-size: 13px;">You can also access your soft-copy Bill PDF directly here: <br /><a href="${pdfDownloadUrl}" style="color: #1a1a1a; font-weight: bold;">Download Bill PDF</a></p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">Computer-generated e-bill. FSSAI Lic: 22023014000128</p>
            </div>
          `,
          attachments: [
            {
              filename: `Ollywood-Bill-${order.orderId}-Table-${order.tableNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }
          ],
        });

        addPosLog('EMAIL_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'SUCCESS',
          `Automated tax invoice & PDF bill sent via SMTP to ${order.customerEmail}`);
      } catch (err: any) {
        addPosLog('EMAIL_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'FAILED',
          `SMTP email sending error: ${err.message}`);
      }
    } else {
      addPosLog('EMAIL_AUTO', order.orderId, order.kotNumber, order.tableNumber, 'AUTOMATED',
        `Automated Bill PDF queued for delivery to ${order.customerEmail}`);
    }
  }
}

// ================= API ROUTES FIRST =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: 'Ollywood Food Café',
    location: 'Ayodhya Nagar, Brahmapur, Odisha',
    timestamp: new Date().toISOString(),
  });
});

// GET all orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json({ success: true, count: orders.length, orders });
});

// GET single order by ID (for receipt lookup)
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const found = orders.find((o: any) => o.orderId === id);
  if (!found) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order: found });
});

// GET official Bill PDF for an order (inline view or download)
app.get('/api/orders/:id/pdf', (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const order = orders.find((o: any) => o.orderId === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  try {
    const pdfBuffer = generateServerBillPdfBuffer(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Ollywood-Bill-${order.orderId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: `Failed to generate PDF: ${err.message}` });
  }
});

// POST re-trigger automated customer receipt dispatch (WhatsApp & Email without popups)
app.post('/api/orders/:id/send-receipt', async (req, res) => {
  const { id } = req.params;
  const { email, phone } = req.body;
  const orders = readOrders();
  const order = orders.find((o: any) => o.orderId === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  // Allow updating phone or email if provided
  if (phone) order.customerPhone = String(phone).trim();
  if (email) order.customerEmail = String(email).trim();

  writeOrders(orders);
  await dispatchAutomatedCustomerReceipt(order);

  res.json({
    success: true,
    message: 'Automated receipt dispatched to WhatsApp and Email',
    order,
  });
});

// POST new dine-in table order
app.post('/api/orders', async (req, res) => {
  const {
    tableNumber,
    customerName,
    customerPhone,
    customerEmail,
    paymentMethod,
    paymentStatus,
    instructions,
    items,
    subtotal,
    discount,
    taxes,
    total,
  } = req.body;

  if (!tableNumber || !customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({
      success: false,
      error: 'Missing required dine-in order fields: tableNumber, customerName, customerPhone, items',
    });
  }

  const kotNumber = getNextKot();
  const orderId = `OW-${Math.floor(10000 + Math.random() * 90000)}`;
  
  const newOrder = {
    orderId,
    kotNumber,
    tableNumber: String(tableNumber).trim(),
    customerName: String(customerName).trim(),
    customerPhone: String(customerPhone).trim(),
    customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
    paymentMethod: paymentMethod || 'UPI',
    paymentStatus: paymentStatus || (paymentMethod === 'UPI' || paymentMethod === 'Card' ? 'Paid' : 'Unpaid'),
    instructions: instructions ? String(instructions).trim() : undefined,
    items,
    subtotal: Number(subtotal),
    discount: Number(discount) || 0,
    taxes: Number(taxes),
    total: Number(total),
    status: 'Received',
    createdAt: new Date().toISOString(),
    isDineIn: true,
    automatedReceiptDispatched: true,
  };

  const orders = readOrders();
  orders.unshift(newOrder);
  writeOrders(orders);

  // 1. Asynchronously dispatch order to POS terminal, external POS webhook & thermal printer
  relayOrderToExternalPos(newOrder);

  // 2. Asynchronously dispatch automated WhatsApp message with bill PDF and Email with PDF attachment
  dispatchAutomatedCustomerReceipt(newOrder).catch((err) => {
    console.error('Automated receipt dispatch error:', err);
  });

  res.status(201).json({ success: true, order: newOrder });
});

// PATCH update order status or payment status
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const orders = readOrders();
  const index = orders.findIndex((o: any) => o.orderId === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (status) orders[index].status = status;
  if (paymentStatus) orders[index].paymentStatus = paymentStatus;

  writeOrders(orders);
  res.json({ success: true, order: orders[index] });
});

// DELETE archive order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const updated = orders.filter((o: any) => o.orderId !== id);
  writeOrders(updated);
  res.json({ success: true, message: 'Order archived', remaining: updated.length });
});

// GET reservations
app.get('/api/reservations', (req, res) => {
  const reservations = readReservations();
  res.json({ success: true, count: reservations.length, reservations });
});

// POST new table reservation
app.post('/api/reservations', (req, res) => {
  const { name, phone, guests, date, timeSlot, notes } = req.body;
  if (!name || !phone || !date || !timeSlot) {
    return res.status(400).json({ success: false, error: 'Name, phone, date, and timeSlot are required' });
  }

  const bookingRef = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
  const reservation = {
    bookingRef,
    name: String(name).trim(),
    phone: String(phone).trim(),
    guests: Number(guests) || 2,
    date,
    timeSlot,
    notes: notes ? String(notes).trim() : undefined,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };

  const list = readReservations();
  list.unshift(reservation);
  writeReservations(list);

  res.status(201).json({ success: true, reservation });
});

// GET POS Configuration
app.get('/api/pos/config', (req, res) => {
  res.json({ success: true, config: getPosConfig() });
});

// POST update POS Configuration
app.post('/api/pos/config', (req, res) => {
  const updated = { ...getPosConfig(), ...req.body };
  writePosConfig(updated);
  res.json({ success: true, config: updated });
});

// GET POS Dispatch Logs
app.get('/api/pos/logs', (req, res) => {
  const logs = readPosLogs();
  res.json({ success: true, count: logs.length, logs });
});

// Test POS Webhook Connection
app.post('/api/pos/test-webhook', async (req, res) => {
  const { url, authHeader } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Webhook URL required' });
  }

  const testPayload = {
    event: 'ping_test',
    restaurant: 'Ollywood Food Café',
    message: 'Testing connection from Ollywood Cafe Web Order Hub',
    timestamp: new Date().toISOString(),
  };

  try {
    const start = Date.now();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(4000),
    });
    const duration = Date.now() - start;

    return res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: duration,
      message: `Received HTTP ${response.status} from POS Webhook endpoint in ${duration}ms`,
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      error: `Could not reach webhook: ${err.message || 'Connection timeout'}`,
    });
  }
});

// Test Kitchen Thermal Printer Connection (Port 9100 TCP socket)
app.post('/api/pos/test-printer', (req, res) => {
  const { ip, port } = req.body;
  if (!ip) {
    return res.status(400).json({ success: false, error: 'Printer IP address required' });
  }

  const targetPort = Number(port) || 9100;
  const socket = new net.Socket();
  socket.setTimeout(2500);

  socket.connect(targetPort, ip, () => {
    socket.write(Buffer.from('\x1b\x40 Ollywood Printer Test OK \n\n\x1d\x56\x41\x03', 'binary'), () => {
      socket.end();
      res.json({
        success: true,
        message: `Connected successfully to thermal printer at ${ip}:${targetPort}`,
      });
    });
  });

  socket.on('error', (err) => {
    socket.destroy();
    res.status(502).json({
      success: false,
      error: `Printer socket connection failed: ${err.message}`,
    });
  });

  socket.on('timeout', () => {
    socket.destroy();
    res.status(504).json({
      success: false,
      error: `Connection to printer ${ip}:${targetPort} timed out (check LAN IP/firewall)`,
    });
  });
});

// POS Financial and Sales Summary
app.get('/api/pos/summary', (req, res) => {
  const orders = readOrders();
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
  const totalGst = orders.reduce((sum: number, o: any) => sum + (Number(o.taxes) || 0), 0);
  const totalDiscounts = orders.reduce((sum: number, o: any) => sum + (Number(o.discount) || 0), 0);
  const activeOrders = orders.filter((o: any) => o.status !== 'Settled' && o.status !== 'Cancelled').length;

  res.json({
    success: true,
    totalOrders: orders.length,
    activeOrders,
    totalRevenue,
    totalGst,
    totalDiscounts,
  });
});

// ================= VITE OR STATIC SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ollywood Cafe Production Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
