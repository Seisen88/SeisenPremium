'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Copy, Crown, Home, Code, Calendar, CreditCard, User, Package, Clock, ShieldCheck, AlertCircle, History, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<{
    key: string;
    tier: string;
    amount: string;
    currency: string;
    orderId: string;
    email: string;
    payerId: string;
    date: string;
    method: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSavedKeys, setShowSavedKeys] = useState(false);
  const [savedKeys, setSavedKeys] = useState<any[]>([]);

  const loadSavedKeys = () => {
    try {
        const keys = JSON.parse(localStorage.getItem('seisen_premium_keys') || '[]');
        setSavedKeys(keys.reverse());
        setShowSavedKeys(true);
    } catch (e) {
        setSavedKeys([]);
    }
  };

  useEffect(() => {
    const data = {
      key: searchParams.get('key') || 'Not Found',
      tier: searchParams.get('tier') || 'premium',
      amount: searchParams.get('amount') || '0.00',
      currency: searchParams.get('currency') || 'EUR',
      orderId: searchParams.get('orderId') || 'UNKNOWN',
      email: searchParams.get('email') || 'Unknown',
      payerId: searchParams.get('payerId') || 'Unknown',
      date: searchParams.get('date') || new Date().toISOString(),
      method: searchParams.get('method') || 'PayPal'
    };
    setOrderData(data);
  }, [searchParams]);

  const handleCopy = async () => {
    if (orderData?.key) {
      await navigator.clipboard.writeText(orderData.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!orderData) return null;

  const dateObj = new Date(orderData.date);
  const formattedDate = !isNaN(dateObj.getTime()) 
      ? dateObj.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
      : 'Unknown Date';

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Order {orderData.orderId}
                </h1>
                <p className="text-gray-500 text-sm">Placed on {formattedDate}</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4" />
                Order Status: Delivered
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Order Items */}
            <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-500" />
                    Order Items
                </h3>
                
                <div className="flex justify-between items-center py-4 border-b border-[#2a2a2a]">
                    <div>
                        <div className="font-medium text-white capitalize">Seisen Hub {orderData.tier}</div>
                        <div className="text-sm text-gray-500">{orderData.tier} x 1</div>
                    </div>
                    <div className="font-mono text-white">
                        {orderData.currency === 'EUR' ? '€' : orderData.currency}
                        {orderData.amount}
                    </div>
                </div>

                <div className="flex justify-between items-center py-2 mt-2">
                    <span className="text-gray-500">Your rating:</span>
                    <div className="flex text-yellow-500">★★★★★</div>
                </div>
                
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#2a2a2a]">
                    <span className="text-gray-400">Total</span>
                    <span className="text-xl font-bold text-white">
                        {orderData.currency === 'EUR' ? '€' : orderData.currency}
                        {orderData.amount}
                    </span>
                </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Payment Information
                </h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="text-white capitalize">{orderData.method}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Account/Email</span>
                        <span className="text-white truncate max-w-[200px]">{orderData.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="text-white font-mono text-sm">{orderData.orderId}</span>
                    </div>
                </div>
            </Card>
        </div>

        {/* Customer Information */}
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex justify-between">
                         <span className="text-gray-500">Email</span>
                         <span className="text-white">{orderData.email}</span>
                    </div>
                    <div className="flex justify-between">
                         <span className="text-gray-500">Order ID</span>
                         <span className="text-white font-mono text-sm">{orderData.orderId}</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between">
                         <span className="text-gray-500">Customer ID</span>
                         <span className="text-white font-mono text-sm">{orderData.payerId}</span>
                    </div>
                     <div className="flex justify-between">
                         <span className="text-gray-500">Customer Since</span>
                         <span className="text-white text-sm">{formattedDate}</span>
                    </div>
                </div>
            </div>
        </Card>

        {/* Delivered Items (Key) */}
        <Card className="p-6 border-l-4 border-l-emerald-500">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Delivered Items
            </h3>
            
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between gap-4">
                <code className="text-emerald-500 font-mono text-lg truncate hover:text-emerald-400 transition-colors">
                    {orderData.key}
                </code>
                <Button size="sm" onClick={handleCopy} className={copied ? "bg-emerald-600" : ""}>
                    {copied ? <CheckCircle className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Delivered on {formattedDate} • Delivered Instantly
            </p>
        </Card>

        {/* Order Timeline */}
        <Card className="p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                Order Timeline
            </h3>
            
            <div className="space-y-6 ml-2 border-l-2 border-[#2a2a2a] pl-6 relative">
                 <div className="relative">
                    <div className="absolute -left-[31px] w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-emerald-500 flex items-center justify-center">
                        <CreditCard className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Order Placed</h4>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                </div>
                
                 <div className="relative">
                    <div className="absolute -left-[31px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Order Delivered</h4>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                </div>
            </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4 flex-wrap">
          <Link href="/">
            <Button variant="secondary">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/scripts">
            <Button variant="secondary">
              <Code className="w-4 h-4" />
              Browse Scripts
            </Button>
          </Link>
          
          <Link href={`/support?reason=premium&plan=${orderData.tier}&amount=${orderData.amount}&currency=${orderData.currency}&subject=Issue with Order ${orderData.orderId}`}>
             <Button variant="secondary" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                 <AlertCircle className="w-4 h-4" />
                 Report Issue
             </Button>
          </Link>
          
          <Button variant="secondary" onClick={loadSavedKeys}>
            <History className="w-4 h-4" />
            View Saved Keys
          </Button>
        </div>

      </div>

      {/* Saved Keys Modal */}
      {showSavedKeys && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200" onClick={() => setShowSavedKeys(false)}>
              <Card className="w-full max-w-lg p-0 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-emerald-500" />
                        My Saved Keys
                    </h2>
                    <button onClick={() => setShowSavedKeys(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                      {savedKeys.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                              No saved keys found on this device.
                          </div>
                      ) : (
                          savedKeys.map((item, idx) => (
                              <div key={idx} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <div className="font-bold text-white capitalize">{item.tier} Plan</div>
                                          <div className="text-xs text-gray-500">{new Date(item.purchaseDate).toLocaleDateString()}</div>
                                      </div>
                                      <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded capitalize">{item.method}</div>
                                  </div>
                                  <div className="flex items-center gap-2 bg-[#0a0a0a] p-2 rounded border border-[#2a2a2a] mb-2">
                                      <code className="text-xs text-emerald-400 flex-1 truncate font-mono">{item.key}</code>
                                      <button onClick={() => navigator.clipboard.writeText(item.key)} className="text-gray-400 hover:text-white p-1">
                                          <Copy className="w-3 h-3" />
                                      </button>
                                  </div>
                                  
                                  <div className="flex gap-2 justify-end">
                                      <Link 
                                        href={`/success?orderId=${item.orderId || 'Unknown'}&tier=${item.tier}&amount=${item.amount}&currency=${item.currency || 'EUR'}&key=${item.key}&email=${item.email || ''}&payerId=${item.payerId || ''}&date=${item.purchaseDate}&method=${item.method}`}
                                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                                      >
                                          <CreditCard className="w-3 h-3" />
                                          View Receipt
                                      </Link>
                                      <Link 
                                        href={`/support?reason=premium&plan=${item.tier}&amount=${item.amount}&currency=${item.currency || 'EUR'}&subject=Issue with Order ${item.orderId || 'Unknown'}`}
                                        className="text-xs text-red-500/70 hover:text-red-400 flex items-center gap-1"
                                      >
                                          <AlertCircle className="w-3 h-3" />
                                          Support
                                      </Link>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
