"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Copy, Home, Download, Shield, ShoppingBag, Calendar, CreditCard, Key, Clock } from 'lucide-react';
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Extract params and construct mock 'order' object to match client page structure
  const orderId = searchParams.get('orderId');
  const tier = searchParams.get('tier');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const keyParam = searchParams.get('key');
  const email = searchParams.get('email');
  const payerId = searchParams.get('payerId');
  const method = searchParams.get('method'); 
  const dateStr = searchParams.get('date');
  const date = dateStr ? new Date(dateStr) : new Date();

  // Parse keys if it looks like a JSON array or just use the string
  let keys: string[] = [];
  if (keyParam) {
    if (keyParam.startsWith('[')) {
        try {
            keys = JSON.parse(keyParam);
        } catch {
            keys = [keyParam];
        }
    } else {
        keys = [keyParam];
    }
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!orderId) {
     return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="text-center p-8 max-w-md">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <h1 className="text-xl font-bold text-white mb-2">Invalid Request</h1>
                <p className="text-gray-500 mb-6">No order details found.</p>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </Card>
        </div>
     );
  }

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center animate-fade-in">
        <div className="max-w-5xl w-full space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Order #{orderId.substring(0, 18)}...
                    </h1>
                    <p className="text-gray-500 text-sm">Placed on {date.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-lg flex items-center gap-2 font-medium print:border-black print:text-black">
                    <CheckCircle className="w-4 h-4" />
                    Status: COMPLETED
                </div>
            </div>

            {/* Delivered Items (Key) - Prominent at Top */}
            <Card className="p-6 border-l-4 border-l-emerald-500 print:border p-6 shadow-none">
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
                    <Key className="w-5 h-5 text-emerald-500 print:text-black" />
                    Delivered Items
                </h3>
                
                {keys.length > 0 ? (
                    <div className="space-y-3">
                         {keys.map((k, i) => (
                            <div key={i} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between gap-4 group hover:border-emerald-500/30 transition-colors print:bg-white print:border-gray-300">
                                <code className="text-emerald-500 font-mono text-lg truncate print:text-black">{k}</code>
                                <button 
                                    onClick={() => handleCopy(k)}
                                    className={`p-2 rounded text-sm font-medium transition-colors flex items-center gap-2 print:hidden ${copiedKey === k ? "bg-emerald-500/20 text-emerald-500" : "bg-[#1f1f1f] text-gray-400 hover:text-white"}`}
                                >
                                    {copiedKey === k ? <CheckCircle className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                                    {copiedKey === k ? "Copied" : "Copy"}
                                </button>
                            </div>
                         ))}
                    </div>
                ) : (
                     <div className="text-gray-500 italic">No keys found for this order.</div>
                )}
                <p className="text-xs text-gray-500 mt-4">
                    Delivered instantly on {date.toLocaleDateString()}
                </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Order Items */}
                <Card className="p-6 h-full flex flex-col print:border shadow-none">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
                        <ShoppingBag className="w-5 h-5 text-emerald-500 print:text-black" />
                        Order Items
                    </h3>
                    
                    <div className="flex justify-between items-center py-4 border-b border-[#2a2a2a] print:border-gray-300">
                        <div>
                            <div className="font-medium text-white capitalize print:text-black">{tier} Plan</div>
                            <div className="text-sm text-gray-500">Seisen Hub Premium x 1</div>
                        </div>
                        <div className="font-mono text-white print:text-black">
                            {currency === 'ROBUX' ? '' : (currency === 'USD' ? '$' : '€')}
                            {amount}
                            {currency === 'ROBUX' ? ' Robux' : ''}
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#2a2a2a] print:border-gray-300">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-white print:text-black">
                             {currency === 'ROBUX' ? '' : (currency === 'USD' ? '$' : '€')}
                             {amount}
                             {currency === 'ROBUX' ? ' Robux' : ''}
                        </span>
                    </div>
                </Card>

                {/* Payment Information */}
                <Card className="p-6 print:border shadow-none">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
                        <CreditCard className="w-5 h-5 text-emerald-500 print:text-black" />
                        Payment Information
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment Status</span>
                            <span className="text-white capitalize print:text-black">COMPLETED</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="text-white truncate max-w-[200px] print:text-black">{email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="text-white font-mono text-sm truncate max-w-[150px] print:text-black">{orderId}</span>
                        </div>
                        {payerId && (
                             <div className="flex justify-between">
                                <span className="text-gray-500">Payer ID</span>
                                <span className="text-white font-mono text-sm print:text-black">{payerId}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Method</span>
                            <span className="text-white capitalize print:text-black">{method || 'N/A'}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Timeline */}
            <Card className="p-6 print:border shadow-none">
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
                    <Calendar className="w-5 h-5 text-emerald-500 print:text-black" />
                    Order Timeline
                </h3>
                
                <div className="space-y-6 ml-2 border-l-2 border-[#2a2a2a] pl-6 relative print:border-gray-300">
                     <div className="relative">
                        <div className="absolute -left-[31px] w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-emerald-500 flex items-center justify-center print:bg-white print:border-black">
                            <CreditCard className="w-3 h-3 text-emerald-500 print:text-black" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium print:text-black">Order Placed</h4>
                            <p className="text-sm text-gray-500">{date.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute -left-[31px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 print:shadow-none print:bg-black">
                            <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium print:text-black">Order Delivered</h4>
                            <p className="text-sm text-gray-500">Instant Delivery</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Footer Buttons */}
            <div className="flex gap-3 print:hidden">
                <Link href="/" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Return Home
                    </Button>
                </Link>
                <Button className="flex-1" onClick={handlePrint}>
                    <Download className="w-4 h-4 mr-2" />
                    Save Receipt
                </Button>
            </div>
            
            <div className="text-center pt-8 print:hidden">
                <Link href="/client/support" className="text-gray-500 hover:text-white text-sm underline">
                    Need help with this order? Contact Support
                </Link>
            </div>
        </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-emerald-500">
          <Clock className="animate-spin w-8 h-8" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
