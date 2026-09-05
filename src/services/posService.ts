import { OrderDetails, OrderStatus } from '../types';

const STORAGE_KEY = 'ollywood_pos_orders_cache';
const KOT_COUNTER_KEY = 'ollywood_pos_kot_counter';

// In production, no fake/demo orders are pre-seeded
export async function fetchServerOrders(): Promise<OrderDetails[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.orders)) {
      // Sync local cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.orders));
      return data.orders;
    }
  } catch (err) {
    console.warn('Network sync failed, reading local cache:', err);
  }
  return getCachedOrders();
}

export function getCachedOrders(): OrderDetails[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Synchronous getter for instant UI render, followed by async refresh
export function getPosOrders(): OrderDetails[] {
  return getCachedOrders();
}

export function saveLocalOrdersCache(orders: OrderDetails[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('ollywood_pos_update', { detail: orders }));
  } catch (err) {
    console.error('Failed to cache orders:', err);
  }
}

export function getNextKotNumber(): number {
  try {
    const raw = localStorage.getItem(KOT_COUNTER_KEY);
    const current = raw ? parseInt(raw, 10) : 100;
    const next = isNaN(current) ? 101 : current + 1;
    localStorage.setItem(KOT_COUNTER_KEY, next.toString());
    return next;
  } catch {
    return Math.floor(100 + Math.random() * 900);
  }
}

// Gentle audio bell sound using Web Audio API when an in-cafe order arrives at POS
export function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First chime ding
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Second chime ding (higher pitch)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.15); // E6
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio context may be restricted before user interaction
  }
}

export async function addPosOrder(order: OrderDetails): Promise<OrderDetails> {
  // Optimistically update local cache and trigger chime
  const current = getCachedOrders();
  const updated = [order, ...current];
  saveLocalOrdersCache(updated);
  playKitchenChime();

  // Send to server
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        // Update with server confirmed docket
        const synced = updated.map(o => o.orderId === order.orderId ? data.order : o);
        saveLocalOrdersCache(synced);
        return data.order;
      }
    }
  } catch (err) {
    console.warn('Server POST /api/orders failed, kept in local queue:', err);
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: 'Unpaid' | 'Paid'
): Promise<OrderDetails[]> {
  const current = getCachedOrders();
  const updated = current.map((o) => {
    if (o.orderId === orderId) {
      return {
        ...o,
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
      };
    }
    return o;
  });
  saveLocalOrdersCache(updated);

  // Sync to server
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus }),
    });
  } catch (err) {
    console.warn('Server PATCH failed:', err);
  }

  return updated;
}

export async function deletePosOrder(orderId: string): Promise<OrderDetails[]> {
  const current = getCachedOrders();
  const updated = current.filter((o) => o.orderId !== orderId);
  saveLocalOrdersCache(updated);

  // Sync to server
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server DELETE failed:', err);
  }

  return updated;
}

export async function submitReservation(reservation: {
  name: string;
  phone: string;
  guests: string | number;
  date: string;
  timeSlot: string;
  notes?: string;
}) {
  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (res.ok) {
      const data = await res.json();
      return data.reservation;
    }
  } catch (err) {
    console.warn('Server reservation submission fallback:', err);
  }
  return {
    bookingRef: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    ...reservation,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };
}

export async function fetchReservations() {
  try {
    const res = await fetch('/api/reservations');
    if (res.ok) {
      const data = await res.json();
      return data.reservations || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function fetchPosConfig() {
  try {
    const res = await fetch('/api/pos/config');
    if (res.ok) {
      const data = await res.json();
      return data.config;
    }
  } catch (err) {
    console.warn('Failed fetching POS config:', err);
  }
  return null;
}

export async function savePosConfig(config: any) {
  try {
    const res = await fetch('/api/pos/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      const data = await res.json();
      return data.config;
    }
  } catch (err) {
    console.error('Failed saving POS config:', err);
  }
  return null;
}

export async function fetchPosLogs() {
  try {
    const res = await fetch('/api/pos/logs');
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch {
    return [];
  }
}

export async function testPosWebhook(url: string, authHeader?: string) {
  try {
    const res = await fetch('/api/pos/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, authHeader }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function testPosPrinter(ip: string, port?: number) {
  try {
    const res = await fetch('/api/pos/test-printer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, port: port || 9100 }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function generateWhatsAppReceiptUrl(order: OrderDetails): string {
  const itemsText = order.items
    .map((i) => `• ${i.name} × ${i.quantity} (₹${i.price * i.quantity})`)
    .join('\n');

  const text = `*OLLIWOOD FOOD CAFÉ - DIGITAL RECEIPT*\n` +
    `Ayodhya Nagar, Brahmapur, Odisha\n` +
    `GSTIN: 21AAAFO9481M1Z5 | FSSAI: 12023034000192\n` +
    `--------------------------------\n` +
    `*KOT Ticket:* #${order.kotNumber}\n` +
    `*Table:* ${order.tableNumber}\n` +
    `*Guest:* ${order.customerName}\n` +
    `*Date & Time:* ${new Date(order.createdAt).toLocaleString('en-IN')}\n` +
    `--------------------------------\n` +
    `*ITEMS ORDERED:*\n${itemsText}\n` +
    `--------------------------------\n` +
    `*Subtotal:* ₹${order.subtotal}\n` +
    (order.discount ? `*Discount:* -₹${order.discount}\n` : '') +
    `*GST (5%):* ₹${order.taxes}\n` +
    `*TOTAL AMOUNT:* ₹${order.total}\n` +
    `*Payment Mode:* ${order.paymentMethod} (${order.paymentStatus || 'Paid'})\n` +
    `--------------------------------\n` +
    `Thank you for dining at Ollywood Food Café!\n` +
    `For salon reservations: +91 90782 66680`;

  const phone = order.customerPhone.replace(/\D/g, '');
  const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
