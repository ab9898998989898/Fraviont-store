"use client";

import { useState } from "react";
import { Eraser, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

const cardClass = "bg-[#111111] border border-[#1E1E1E] p-8 max-w-2xl";

export default function MaintenancePage() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const resetData = api.settings.resetData.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setIsConfirming(false);
      toast.success("Data reset successfully");
    },
    onError: (e) => {
      toast.error(e.message || "Failed to reset data");
    }
  });

  const handleReset = () => {
    resetData.mutate();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-ivory font-light text-3xl mb-2">
          Maintenance
        </h2>
        <p className="text-ash text-sm font-sans font-light">
          Manage system health and perform destructive maintenance operations.
        </p>
      </div>

      <div className={cardClass}>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center shrink-0">
            <Eraser size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-ivory text-lg font-sans font-medium mb-1">
              Reset Transactional Data
            </h3>
            <p className="text-ash text-sm font-sans leading-relaxed">
              This will permanently delete all **Orders**, **Customers**, **Order Items**, and **Inventory Logs**. 
              This action is typically performed before handing the site to a client or when moving from staging to production.
            </p>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 p-4 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-red-200 text-xs font-sans font-medium uppercase tracking-wider">
                Warning
              </p>
              <p className="text-red-300/80 text-xs font-sans leading-relaxed">
                This action cannot be undone. Product data and settings will be preserved, but all sales history and customer profiles will be lost.
              </p>
            </div>
          </div>
        </div>

        {!isSuccess ? (
          <div className="flex items-center gap-4">
            {!isConfirming ? (
              <button
                onClick={() => setIsConfirming(true)}
                className="bg-red-600 text-white text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-4 hover:bg-red-700 transition-colors duration-300"
              >
                Reset All Data
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <button
                  onClick={handleReset}
                  disabled={resetData.isPending}
                  className="w-full sm:w-auto bg-red-600 text-white text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-4 hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetData.isPending && <Loader2 size={16} className="animate-spin" />}
                  Confirm Permanent Delete
                </button>
                <button
                  onClick={() => setIsConfirming(false)}
                  disabled={resetData.isPending}
                  className="w-full sm:w-auto text-ash hover:text-ivory text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-4 border border-[#2A2A2A] hover:border-ash transition-colors duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-emerald-400 font-sans text-sm">
            <CheckCircle2 size={20} />
            Data has been reset successfully.
            <button 
              onClick={() => setIsSuccess(false)}
              className="ml-4 text-ash underline hover:text-ivory transition-colors"
            >
              Reset again?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
