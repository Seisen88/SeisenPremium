"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Copy,
  Home,
  ArrowLeft,
  Download,
  Shield,
  Clock,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Extract params
  const orderId = searchParams.get("orderId");
  const tier = searchParams.get("tier");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency");
  const key = searchParams.get("key");
  const email = searchParams.get("email");
  const method = searchParams.get("method");
  const date = searchParams.get("date")
    ? new Date(searchParams.get("date")!).toLocaleString()
    : new Date().toLocaleString();

  const handleCopy = async () => {
    if (key) {
      const success = await copyToClipboard(key);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
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
    <div className="min-h-screen py-10 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Success Header */}
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-500/50">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-400">Thank you for your purchase.</p>
        </div>

        {/* Receipt Card */}
        <Card className="p-0 overflow-hidden border-emerald-500/20 shadow-2xl relative print:shadow-none print:border-black">
          {/* Top Bar Decoration */}
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />

          <div className="p-6 md:p-8 space-y-6">
            {/* Key Section */}
            <div className="bg-[#0a0a0a] rounded-xl p-5 border border-[#222] text-center print:border-gray-300 print:bg-white">
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-3">
                Your Premium Key
              </p>
              <div className="flex items-center gap-2 justify-center bg-black/50 p-3 rounded-lg border border-[#333] mb-3 print:bg-white print:border-black">
                <code className="text-emerald-400 font-mono text-lg break-all selection:bg-emerald-500/30 print:text-black">
                  {key || "Generating..."}
                </code>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="mx-auto flex items-center gap-2 print:hidden"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied to Clipboard" : "Copy Key"}
              </Button>
            </div>

            <div className="border-t border-dashed border-[#333] my-6 print:border-gray-400" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="text-white font-mono text-xs mt-1 print:text-black">
                  {orderId.substring(0, 18)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Date</p>
                <p className="text-white mt-1 print:text-black">
                  {date.split(",")[0]}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Plan</p>
                <p className="text-white capitalize mt-1 print:text-black">
                  {tier}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Amount</p>
                <p className="text-white mt-1 print:text-black font-semibold">
                  {currency === "ROBUX"
                    ? `${amount} Robux`
                    : `${amount} ${currency || "EUR"}`}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="text-white capitalize mt-1 print:text-black flex items-center gap-1.5">
                  {method === "paypal"
                    ? "PayPal"
                    : method === "robux"
                      ? "Robux"
                      : method || "Card"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Status</p>
                <p className="text-emerald-500 mt-1 font-medium print:text-black">
                  Paid
                </p>
              </div>
            </div>

            {/* Email Backup Notice */}
            {email && (
              <div className="bg-blue-500/5 p-3 rounded border border-blue-500/10 flex gap-3 mt-4 print:hidden">
                <div className="mt-0.5">
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-blue-400 font-medium block mb-0.5">
                    Backup Secured
                  </span>
                  A copy of this receipt has been linked to{" "}
                  <strong>{email}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#0f0f0f] px-6 py-4 flex items-center justify-between border-t border-[#1f1f1f] text-xs text-gray-500 print:bg-white print:border-gray-300">
            <span className="print:hidden">
              Need help?{" "}
              <a href="/client/support" className="text-white hover:underline">
                Contact Support
              </a>
            </span>
            <span>Seisen Hub Premium</span>
          </div>
        </Card>

        {/* Action Buttons */}
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
