import React, { useState, useEffect } from 'react';
import { OllywoodLogo } from './OllywoodLogo';
import {
  X,
  Printer,
  ChefHat,
  Check,
  Clock,
  Phone,
  AlertCircle,
  Sparkles,
  Volume2,
  RotateCcw,
  Trash2,
  Calendar,
  FileSpreadsheet,
  DollarSign,
  Users,
  Network,
  Wifi,
  Send,
  Save,
  CheckCircle2,
  Radio,
  HardDrive,
  Settings,
  MessageSquare,
  FileDown,
  Mail,
} from 'lucide-react';
import { OrderDetails, OrderStatus, PosIntegrationConfig, PosDispatchLog } from '../types';
import {
  getPosOrders,
  fetchServerOrders,
  updateOrderStatus,
  deletePosOrder,
  playKitchenChime,
  fetchReservations,
  fetchPosConfig,
  savePosConfig,
  fetchPosLogs,
  testPosWebhook,
  testPosPrinter,
  generateWhatsAppReceiptUrl,
} from '../services/posService';

interface PosTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderForReceipt?: (order: OrderDetails) => void;
}

export const PosTerminalModal: React.FC<PosTerminalModalProps> = ({
  isOpen,
  onClose,
  onSelectOrderForReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'financials' | 'integration'>('orders');
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hardware & POS Relay State
  const [posConfig, setPosConfig] = useState<PosIntegrationConfig>({
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
    autoPrintKot: false,
  });
  const [posLogs, setPosLogs] = useState<PosDispatchLog[]>([]);
  const [testWebhookResult, setTestWebhookResult] = useState<{ loading: boolean; text?: string; success?: boolean } | null>(null);
  const [testPrinterResult, setTestPrinterResult] = useState<{ loading: boolean; text?: string; success?: boolean } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const serverOrders = await fetchServerOrders();
      setOrders(serverOrders);
      if (serverOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(serverOrders[0]);
      } else if (serverOrders.length === 0) {
        setSelectedOrder(null);
      }

      const resList = await fetchReservations();
      setReservations(resList);

      const cfg = await fetchPosConfig();
      if (cfg) setPosConfig(cfg);

      const logs = await fetchPosLogs();
      setPosLogs(logs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Auto-poll server every 6 seconds for new orders while POS terminal is open
      const pollTimer = setInterval(() => {
        fetchServerOrders().then((latest) => {
          setOrders(latest);
        });
      }, 6000);

      const handlePosUpdate = () => {
        setOrders(getPosOrders());
      };

      window.addEventListener('ollywood_pos_update', handlePosUpdate);
      return () => {
        clearInterval(pollTimer);
        window.removeEventListener('ollywood_pos_update', handlePosUpdate);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    const updated = await updateOrderStatus(orderId, selectedOrder?.status || 'Received', 'Paid');
    setOrders(updated);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: 'Paid' });
    }
  };

  const handleDelete = async (orderId: string) => {
    const updated = await deletePosOrder(orderId);
    setOrders(updated);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(updated[0] || null);
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = ['Order_ID', 'KOT_No', 'Table', 'Customer_Name', 'Phone', 'Items_Count', 'Subtotal', 'GST_5_Percent', 'Grand_Total', 'Payment_Method', 'Payment_Status', 'Order_Status', 'Timestamp'];
    const rows = orders.map((o) => [
      o.orderId,
      o.kotNumber,
      `"${o.tableNumber}"`,
      `"${o.customerName}"`,
      o.customerPhone,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal,
      o.taxes,
      o.total,
      `"${o.paymentMethod}"`,
      o.paymentStatus || 'Unpaid',
      o.status,
      `"${o.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ollywood_POS_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConfig = async () => {
    const updated = await savePosConfig(posConfig);
    if (updated) {
      setPosConfig(updated);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
      const logs = await fetchPosLogs();
      setPosLogs(logs);
    }
  };

  const handleTestWebhook = async () => {
    if (!posConfig.webhookUrl) {
      setTestWebhookResult({ loading: false, text: 'Please enter a valid Webhook URL first', success: false });
      return;
    }
    setTestWebhookResult({ loading: true });
    const res = await testPosWebhook(posConfig.webhookUrl, posConfig.webhookAuthHeader);
    if (res.success) {
      setTestWebhookResult({ loading: false, text: res.message || 'Connected successfully! HTTP 200 OK', success: true });
    } else {
      setTestWebhookResult({ loading: false, text: res.error || 'Connection failed', success: false });
    }
    const logs = await fetchPosLogs();
    setPosLogs(logs);
  };

  const handleTestPrinter = async () => {
    if (!posConfig.networkPrinterIp) {
      setTestPrinterResult({ loading: false, text: 'Please enter a printer IP address first', success: false });
      return;
    }
    setTestPrinterResult({ loading: true });
    const res = await testPosPrinter(posConfig.networkPrinterIp, posConfig.networkPrinterPort);
    if (res.success) {
      setTestPrinterResult({ loading: false, text: res.message || 'Test print packet sent to printer successfully!', success: true });
    } else {
      setTestPrinterResult({ loading: false, text: res.error || 'Printer unreachable or timed out', success: false });
    }
    const logs = await fetchPosLogs();
    setPosLogs(logs);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const activeCount = orders.filter((o) => o.status !== 'Settled' && o.status !== 'Cancelled').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalGst = orders.reduce((sum, o) => sum + (o.taxes || 0), 0);
  const settledCount = orders.filter((o) => o.status === 'Settled').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1A1A1A]/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#1A1A1A] text-[#FDFCFB] w-full max-w-5xl h-[90vh] border border-white/20 flex flex-col shadow-2xl overflow-hidden font-mono">
        
        {/* Terminal Top Bar */}
        <div className="p-4 border-b border-white/15 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center p-0.5">
              <OllywoodLogo size={38} showSlogan={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-serif">
                  Ollywood Food Café POS Station
                </h2>
                <span className="bg-[#1b6d24] text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  PRODUCTION LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Connected to Express Backend API • Port 3000 • Berhampur Station
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => playKitchenChime()}
              className="p-1.5 border border-white/20 hover:border-white text-xs flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Test Kitchen Bell"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Bell</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 border border-white/20 hover:border-white text-xs flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Reload from server"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[10px]">Sync</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 border border-white/20 hover:border-white text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-4 py-2 bg-[#181818] border-b border-white/10 flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-white/10 hover:border-white/30 text-white/70'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Dockets ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reservations'
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-white/10 hover:border-white/30 text-white/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Table Bookings ({reservations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'financials'
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-white/10 hover:border-white/30 text-white/70'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Shift Summary & CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('integration')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'integration'
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-white/10 hover:border-white/30 text-white/70'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Hardware & POS Relay Hub</span>
            </button>
          </div>

          <div className="text-[11px] text-amber-300 font-bold shrink-0">
            {activeCount} Active Table Dockets
          </div>
        </div>

        {/* TAB 1: KITCHEN DOCKETS */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="px-4 py-2 bg-[#1A1A1A] border-b border-white/10 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">Status:</span>
              {(['all', 'Received', 'Preparing', 'Served', 'Settled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/10 hover:border-white/30 text-white/70'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>

            {/* Split Screen */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              
              {/* Left Order Dockets List */}
              <div className="md:col-span-5 border-r border-white/10 overflow-y-auto divide-y divide-white/10 bg-[#141414]">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-white/50 text-xs space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto opacity-40 text-amber-400" />
                    <p className="font-bold text-white/80">No orders placed yet</p>
                    <p className="text-[10px] text-white/50 max-w-xs mx-auto">
                      Orders submitted by customers from their tables will instantly appear here with live chime notification.
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    const isSelected = selectedOrder?.orderId === ord.orderId;
                    const itemCount = ord.items.reduce((sum, i) => sum + i.quantity, 0);
                    const time = new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={ord.orderId}
                        onClick={() => setSelectedOrder(ord)}
                        className={`p-3.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#242424] border-l-4 border-amber-400'
                            : 'hover:bg-[#1c1c1c]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold text-sm">
                              {ord.tableNumber}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-white/10 text-white/80 rounded">
                              KOT #{ord.kotNumber}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50">{time}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-white truncate max-w-[140px]">
                            {ord.customerName}
                          </span>
                          <span className="font-bold text-amber-300">₹{ord.total}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white/60">
                            {itemCount} {itemCount === 1 ? 'plate' : 'plates'} • {ord.paymentMethod}
                          </span>
                          <span className={`px-1.5 py-0.5 uppercase tracking-wider font-bold text-[9px] ${
                            ord.status === 'Received'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                              : ord.status === 'Preparing'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40 animate-pulse'
                              : ord.status === 'Served'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Order Details */}
              <div className="md:col-span-7 overflow-y-auto p-4 sm:p-6 bg-[#1A1A1A] flex flex-col justify-between">
                {selectedOrder ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="border border-white/20 p-4 bg-[#141414] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/15">
                        <div>
                          <span className="text-[10px] text-white/50 uppercase tracking-widest block">
                            Kitchen Order Ticket (KOT)
                          </span>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>{selectedOrder.tableNumber}</span>
                            <span className="text-amber-400 text-sm font-normal">
                              (KOT #{selectedOrder.kotNumber})
                            </span>
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/50 block">Docket Ref</span>
                          <span className="text-xs font-bold text-white/90">{selectedOrder.orderId}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-white/50 text-[10px] block">Customer Name</span>
                          <strong className="text-white text-sm">{selectedOrder.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-white/50 text-[10px] block">Customer Phone</span>
                          <span className="text-white flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-400" />
                            +91 {selectedOrder.customerPhone}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 text-[10px] block">Bill Total</span>
                          <strong className="text-amber-300 text-base">₹{selectedOrder.total}</strong>
                          <span className="text-[10px] text-white/50 block">
                            (Inc. ₹{selectedOrder.taxes} GST)
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 text-[10px] block">Settlement State</span>
                          <span className="text-xs font-bold text-white">
                            {selectedOrder.paymentMethod} •{' '}
                            <span className={selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                              {selectedOrder.paymentStatus || 'Unpaid'}
                            </span>
                          </span>
                          {selectedOrder.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => handleMarkPaid(selectedOrder.orderId)}
                              className="mt-1 text-[9px] underline text-amber-300 hover:text-white block cursor-pointer"
                            >
                              Mark Settled (Paid at Table)
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedOrder.instructions && (
                        <div className="p-2 border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs">
                          <strong>Chef Note:</strong> "{selectedOrder.instructions}"
                        </div>
                      )}
                    </div>

                    {/* Plates */}
                    <div className="border border-white/20 p-4 bg-[#141414] space-y-2">
                      <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-wider pb-1 border-b border-white/10 font-bold">
                        <span>Dish & Portion</span>
                        <span>Quantity</span>
                        <span>Amount</span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${item.type === 'Veg' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="font-bold text-white">{item.name}</span>
                            </div>
                            <div className="font-mono font-bold text-amber-400 text-sm px-3 py-0.5 bg-white/5 border border-white/10 rounded">
                              {item.quantity}×
                            </div>
                            <div className="text-right text-white/80 font-mono">
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progression Workflow */}
                    <div className="p-4 border border-white/20 bg-[#141414] space-y-2">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider block">
                        Kitchen Progress Action
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handleStatusChange(selectedOrder.orderId, 'Received')}
                          className={`py-2 px-2 text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'Received'
                              ? 'border-blue-500 bg-blue-600 text-white shadow-lg'
                              : 'border-white/20 hover:border-white/50 text-white/70'
                          }`}
                        >
                          1. Logged
                        </button>

                        <button
                          onClick={() => handleStatusChange(selectedOrder.orderId, 'Preparing')}
                          className={`py-2 px-2 text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'Preparing'
                              ? 'border-amber-400 bg-amber-400 text-black shadow-lg font-extrabold animate-pulse'
                              : 'border-white/20 hover:border-white/50 text-white/70'
                          }`}
                        >
                          2. In Hearth
                        </button>

                        <button
                          onClick={() => handleStatusChange(selectedOrder.orderId, 'Served')}
                          className={`py-2 px-2 text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'Served'
                              ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg'
                              : 'border-white/20 hover:border-white/50 text-white/70'
                          }`}
                        >
                          3. Served
                        </button>

                        <button
                          onClick={() => handleStatusChange(selectedOrder.orderId, 'Settled')}
                          className={`py-2 px-2 text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                            selectedOrder.status === 'Settled'
                              ? 'border-neutral-400 bg-white text-black font-extrabold'
                              : 'border-white/20 hover:border-white/50 text-white/70'
                          }`}
                        >
                          4. Settle Bill
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {onSelectOrderForReceipt && (
                        <button
                          onClick={() => {
                            onSelectOrderForReceipt(selectedOrder);
                            onClose();
                          }}
                          className="py-2.5 px-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold border border-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>View Customer Soft Copy</span>
                        </button>
                      )}

                      <button
                        onClick={() => window.print()}
                        className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print KOT Slip</span>
                      </button>

                      <a
                        href={`/api/orders/${selectedOrder.orderId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download or View Tax Invoice PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bill PDF</span>
                      </a>

                      <button
                        onClick={() => handleDelete(selectedOrder.orderId)}
                        className="py-2.5 px-3 text-red-400 hover:text-red-300 text-xs border border-red-500/30 hover:border-red-500/60 ml-auto flex items-center gap-1 transition-colors cursor-pointer"
                        title="Archive Docket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 text-xs py-16">
                    <ChefHat className="w-8 h-8 mb-2 opacity-30" />
                    <span>Select an active table docket to inspect KOT</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: TABLE RESERVATIONS LOG */}
        {activeTab === 'reservations' && (
          <div className="flex-1 p-6 overflow-y-auto bg-[#141414] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Guest Table Reservations Log</h3>
                <p className="text-xs text-white/60">Live priority salon bookings stored in server database</p>
              </div>
              <span className="text-xs text-amber-400 font-bold">{reservations.length} Registered Bookings</span>
            </div>

            {reservations.length === 0 ? (
              <div className="py-16 text-center text-white/40 text-xs space-y-2">
                <Calendar className="w-8 h-8 mx-auto opacity-30" />
                <p>No table reservations recorded yet.</p>
                <p className="text-[11px] text-white/30">Guests can book via the Table Booking form on the page.</p>
              </div>
            ) : (
              <div className="border border-white/20 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1F1F1F] text-white/60 border-b border-white/20 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Date & Slot</th>
                      <th className="p-3">Special Request</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {reservations.map((res: any) => (
                      <tr key={res.bookingRef} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-amber-400">{res.bookingRef}</td>
                        <td className="p-3 text-white font-semibold">{res.name}</td>
                        <td className="p-3 text-white/80">+91 {res.phone}</td>
                        <td className="p-3">{res.guests} Guests</td>
                        <td className="p-3 text-white font-medium">{res.date} • {res.timeSlot}</td>
                        <td className="p-3 text-white/60 max-w-xs truncate">{res.notes || '—'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] uppercase font-bold rounded">
                            {res.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHIFT FINANCIAL REPORT */}
        {activeTab === 'financials' && (
          <div className="flex-1 p-6 overflow-y-auto bg-[#141414] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Daily Shift Financial Summary</h3>
                <p className="text-xs text-white/60">Real-time revenue, statutory 5% restaurant GST, and sales metrics</p>
              </div>
              <button
                onClick={handleExportCsv}
                disabled={orders.length === 0}
                className="py-2 px-3.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Daily CSV Report</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 border border-white/20 bg-[#1A1A1A]">
                <span className="text-[10px] text-white/50 uppercase block mb-1">Gross Collections</span>
                <span className="text-2xl font-bold text-amber-300">₹{totalRevenue}</span>
              </div>
              <div className="p-4 border border-white/20 bg-[#1A1A1A]">
                <span className="text-[10px] text-white/50 uppercase block mb-1">GST (5% Statutory)</span>
                <span className="text-2xl font-bold text-white">₹{totalGst}</span>
              </div>
              <div className="p-4 border border-white/20 bg-[#1A1A1A]">
                <span className="text-[10px] text-white/50 uppercase block mb-1">Total Dockets</span>
                <span className="text-2xl font-bold text-white">{orders.length}</span>
              </div>
              <div className="p-4 border border-white/20 bg-[#1A1A1A]">
                <span className="text-[10px] text-white/50 uppercase block mb-1">Settled / Closed</span>
                <span className="text-2xl font-bold text-emerald-400">{settledCount}</span>
              </div>
            </div>

            {/* Shift audit details */}
            <div className="border border-white/20 p-4 bg-[#1A1A1A] space-y-2 text-xs text-white/70">
              <h4 className="text-xs uppercase font-bold text-white">Terminal Audit Parameters</h4>
              <p>• Establishment: <strong>Ollywood Food Café</strong> (GSTIN: 21AAAFO9481M1Z5)</p>
              <p>• Station: Ayodhya Nagar, Brahmapur (Berhampur), Ganjam, Odisha 760008</p>
              <p>• Tax Computation: CGST 2.5% + SGST 2.5% strictly adhering to Indian Restaurant GST norms.</p>
              <p>• Real-time data pipeline: Zero mock records. All entries represent actual table guest dockets.</p>
            </div>
          </div>
        )}

        {/* TAB 4: HARDWARE & POS RELAY HUB */}
        {activeTab === 'integration' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#141414] space-y-6">
            
            {/* Hub Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">POS Hardware, Webhook & Printer Hub</h3>
                  <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-bold uppercase rounded">
                    Architecture Setup
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">
                  How dine-in table orders are dispatched to kitchen terminals, billing systems, and thermal printers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccessMsg && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                <button
                  onClick={handleSaveConfig}
                  className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save POS Settings</span>
                </button>
              </div>
            </div>

            {/* Architecture Pipeline Explanation Card */}
            <div className="p-4 bg-[#1A1A1A] border border-white/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Real-Time Dispatch Pipeline Architecture</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                When a customer sits at any table in <strong>Ollywood Food Café</strong> (e.g. <em>Hall T-03</em>) and submits an order, it is processed via the production Express backend and instantly relayed across <strong>4 hardware and software channels</strong>:
              </p>

              {/* Step Flow Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                <div className="p-3 bg-black/40 border border-white/10 space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">1. In-Cafe KDS Terminal</div>
                  <div className="text-white font-semibold">Kitchen Screen Alert</div>
                  <p className="text-[11px] text-white/60">Audio chime rings, docket appears on kitchen tablet or billing PC screen.</p>
                  <span className="inline-block mt-1 text-[9px] text-emerald-400 font-mono font-bold">● Active (Zero Setup)</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">2. POS Webhook Relay</div>
                  <div className="text-white font-semibold">Petpooja / Posist / PC</div>
                  <p className="text-[11px] text-white/60">HTTP POST sends complete JSON ticket to external cafe billing software.</p>
                  <span className="inline-block mt-1 text-[9px] text-amber-300 font-mono font-bold">
                    {posConfig.webhookEnabled ? '● Relay Enabled' : '○ Standby / Optional'}
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">3. Thermal KOT Printer</div>
                  <div className="text-white font-semibold">Port 9100 LAN Socket</div>
                  <p className="text-[11px] text-white/60">Prints raw ESC/POS slip directly to kitchen printer (Epson, TVS, Star).</p>
                  <span className="inline-block mt-1 text-[9px] text-amber-300 font-mono font-bold">
                    {posConfig.networkPrinterEnabled ? '● Network Socket Active' : '○ Standby / Optional'}
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">4. Customer Soft Copy</div>
                  <div className="text-white font-semibold">WhatsApp & PDF Bill</div>
                  <p className="text-[11px] text-white/60">Digital tax invoice with GSTIN & FSSAI delivered to guest's mobile phone.</p>
                  <span className="inline-block mt-1 text-[9px] text-emerald-400 font-mono font-bold">● Active (1-Click wa.me)</span>
                </div>
              </div>
            </div>

            {/* Hardware & Relay Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Channel 1: In-Cafe Kitchen Display Terminal */}
              <div className="p-4 border border-white/20 bg-[#1A1A1A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs uppercase font-bold text-white">Channel 1: Built-in KDS Terminal</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] uppercase font-bold rounded">
                    Ready & Online
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Any device in the cafe (cashier Windows PC, counter iPad, or kitchen Android tablet) can simply open this app and view the <strong>Kitchen Dockets</strong> tab.
                </p>
                <div className="space-y-2 text-xs bg-black/30 p-3 border border-white/10">
                  <div className="flex items-center justify-between text-white/80">
                    <span>Auto-Sync Frequency:</span>
                    <strong className="text-amber-300">Every 6 Seconds + Instant Events</strong>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>Kitchen Bell Audio Chime:</span>
                    <strong className="text-emerald-400">Web Audio Synthesizer (Active)</strong>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>KOT Numbering Sequence:</span>
                    <strong className="text-white">Auto-incrementing (#101, #102...)</strong>
                  </div>
                </div>
              </div>

              {/* Channel 2: External POS Webhook (Petpooja / Posist / Local POS PC) */}
              <div className="p-4 border border-white/20 bg-[#1A1A1A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs uppercase font-bold text-white">Channel 2: External POS Webhook</h4>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={posConfig.webhookEnabled}
                      onChange={(e) => setPosConfig({ ...posConfig, webhookEnabled: e.target.checked })}
                      className="accent-amber-400"
                    />
                    <span className="text-[10px] uppercase font-bold">{posConfig.webhookEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>
                <p className="text-xs text-white/70">
                  If your cafe uses <strong>Petpooja, UrbanPiper, Posist</strong>, or a custom desktop billing software with an HTTP API, configure its endpoint below:
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-white/60 uppercase block mb-1">POS Push URL / Webhook Endpoint</label>
                    <input
                      type="text"
                      placeholder="e.g. https://api.petpooja.com/push_order or http://192.168.1.50:8080/api/order"
                      value={posConfig.webhookUrl || ''}
                      onChange={(e) => setPosConfig({ ...posConfig, webhookUrl: e.target.value })}
                      className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 uppercase block mb-1">API Key / Authorization Header (Optional)</label>
                    <input
                      type="text"
                      placeholder="Bearer YOUR_SECRET_API_TOKEN"
                      value={posConfig.webhookAuthHeader || ''}
                      onChange={(e) => setPosConfig({ ...posConfig, webhookAuthHeader: e.target.value })}
                      className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={handleTestWebhook}
                      disabled={testWebhookResult?.loading || !posConfig.webhookUrl}
                      className="py-1.5 px-3 bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>{testWebhookResult?.loading ? 'Pinging POS...' : 'Test Ping Webhook'}</span>
                    </button>

                    {testWebhookResult?.text && (
                      <span className={`text-[10px] truncate max-w-xs ${testWebhookResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {testWebhookResult.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Channel 3: Kitchen Thermal Network Printer (ESC/POS Port 9100) */}
              <div className="p-4 border border-white/20 bg-[#1A1A1A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs uppercase font-bold text-white">Channel 3: Kitchen Thermal Network Printer</h4>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={posConfig.networkPrinterEnabled}
                      onChange={(e) => setPosConfig({ ...posConfig, networkPrinterEnabled: e.target.checked })}
                      className="accent-amber-400"
                    />
                    <span className="text-[10px] uppercase font-bold">{posConfig.networkPrinterEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>
                <p className="text-xs text-white/70">
                  Direct raw socket print to an 80mm ESC/POS thermal printer (Epson, TVS, Posiflex) on the cafe's local Wi-Fi or LAN:
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="col-span-2">
                    <label className="text-[10px] text-white/60 uppercase block mb-1">Printer LAN IP Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.87"
                      value={posConfig.networkPrinterIp || ''}
                      onChange={(e) => setPosConfig({ ...posConfig, networkPrinterIp: e.target.value })}
                      className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 uppercase block mb-1">Port (Default 9100)</label>
                    <input
                      type="number"
                      placeholder="9100"
                      value={posConfig.networkPrinterPort || 9100}
                      onChange={(e) => setPosConfig({ ...posConfig, networkPrinterPort: Number(e.target.value) || 9100 })}
                      className="w-full bg-[#121212] border border-white/20 p-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    onClick={handleTestPrinter}
                    disabled={testPrinterResult?.loading || !posConfig.networkPrinterIp}
                    className="py-1.5 px-3 bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Printer className="w-3 h-3 text-amber-400" />
                    <span>{testPrinterResult?.loading ? 'Connecting...' : 'Send Test KOT Slip'}</span>
                  </button>

                  {testPrinterResult?.text && (
                    <span className={`text-[10px] truncate max-w-xs ${testPrinterResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {testPrinterResult.text}
                    </span>
                  )}
                </div>
              </div>

              {/* Channel 4: Customer Digital Soft Copy via WhatsApp & PDF */}
              <div className="p-4 border border-white/20 bg-[#1A1A1A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs uppercase font-bold text-white">Channel 4: Customer Soft-Copy Bill</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] uppercase font-bold rounded">
                    Active
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Indian paperless billing norm: Immediately after placing their table order, guests can click <strong>"Send Soft Copy to WhatsApp"</strong> to receive an itemized digital receipt directly on their WhatsApp phone with GSTIN and FSSAI credentials.
                </p>

                <div className="p-3 bg-black/40 border border-white/10 space-y-1 text-xs text-white/80">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Included in Digital Soft Copy:</div>
                  <p>✓ KOT Ticket # & Assigned Table Number</p>
                  <p>✓ All ordered dishes with itemized prices & quantities</p>
                  <p>✓ Statutory 5% GST (2.5% CGST + 2.5% SGST) breakdown</p>
                  <p>✓ Cafe GSTIN (21AAAFO9481M1Z5) & FSSAI (12023034000192)</p>
                </div>
              </div>

            </div>

            {/* Live Dispatch Audit Logs */}
            <div className="p-4 border border-white/20 bg-[#1A1A1A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs uppercase font-bold text-white">Live POS Dispatch & Relay Audit Log</h4>
                </div>
                <button
                  onClick={async () => {
                    const logs = await fetchPosLogs();
                    setPosLogs(logs);
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Refresh Logs
                </button>
              </div>

              {posLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/50 bg-[#121212]">
                  No dispatch logs recorded yet. Place a test order from any table to see the live relay trace here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-white/10">
                    <thead className="bg-[#121212] text-white/60 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Channel</th>
                        <th className="p-2.5">KOT / Ref</th>
                        <th className="p-2.5">Table</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Diagnostic Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 font-mono text-[11px]">
                      {posLogs.slice(0, 15).map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="p-2.5 text-white/50">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</td>
                          <td className="p-2.5 font-bold text-amber-300">{log.type}</td>
                          <td className="p-2.5 text-white font-medium">#{log.kotNumber} ({log.orderId})</td>
                          <td className="p-2.5 text-amber-400">{log.tableNumber}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-white/70 max-w-md truncate">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
