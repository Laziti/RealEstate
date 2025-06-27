import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  listingsPerMonth: number;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'monthly-basic',
    name: 'Basic Monthly',
    price: 800,
    duration: '1 month',
    listingsPerMonth: 20,
  },
  {
    id: 'monthly-pro',
    name: 'Pro Monthly',
    price: 1000,
    duration: '1 month',
    listingsPerMonth: 35,
  },
  {
    id: 'semi-annual',
    name: 'Semi-Annual Pro',
    price: 4000,
    duration: '6 months',
    listingsPerMonth: 50,
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: 6000,
    duration: '1 year',
    listingsPerMonth: 50,
  },
];

const PLAN_ID_MAP: Record<string, string> = {
  'monthly-basic': 'basic_monthly',
  'monthly-pro': 'pro_monthly',
  'semi-annual': 'pro_semi_annual',
  'annual': 'pro_annual',
};

const UpgradeSidebar = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'pro' | 'pending' | 'rejected'>('free');
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState(false);

  // Poll for subscription status changes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const { data: requests, error } = await supabase
        .from('subscription_requests')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && requests && requests.length > 0) {
        const status = requests[0].status;
        if (status === 'rejected' && lastStatus !== 'rejected') {
          setSubscriptionStatus('free');
          setRejectionMessage('Your upgrade request was rejected. You can request an upgrade again.');
          setReceipt(null);
          setReceiptPreview(null);
          setError(null);
        } else if (status === 'pending') {
          setSubscriptionStatus('pending');
          setRejectionMessage(null);
        } else if (status === 'approved') {
          setSubscriptionStatus('pro');
          setRejectionMessage(null);
        } else if (status === 'free') {
          setSubscriptionStatus('free');
          setRejectionMessage(null);
        }
        setLastStatus(status);
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user, lastStatus]);

  // Workaround: Reopen dialog if receipt is selected but dialog is closed (mobile bug)
  useEffect(() => {
    if (receipt && !selectedPlan) {
      setSelectedPlan(null);
    }
  }, [receipt, selectedPlan]);

  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setReceipt(null);
    setReceiptPreview(null);
    setError(null);
  };

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Relaxed file type validation for gallery/camera
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImage = (file.type && file.type.startsWith('image/')) || (!file.type && ext && ['jpg','jpeg','png','gif','webp'].includes(ext));
    const isPdf = file.type === 'application/pdf' || (!file.type && ext === 'pdf');
    if (!isImage && !isPdf) {
      setError('Please select an image or PDF file');
      return;
    }
    // Validate file size (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      setError('File size must be less than 15MB');
      return;
    }
    setReceipt(file);
    setError(null);
    // Show preview for images
    if (isImage) {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(URL.createObjectURL(file));
    } else {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!receipt || !selectedPlan || !user) {
      setError('Please select a receipt file');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload receipt to storage
      const fileName = `${user.id}/${Date.now()}-${receipt.name}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receipt);

      if (uploadError) {
        setError('Failed to upload receipt. Please try again.');
        return;
      }

      // Create subscription request record
      const { error: dbError } = await supabase
        .from('subscription_requests')
        .insert([{
          user_id: user.id,
          plan_id: PLAN_ID_MAP[selectedPlan.id],
          receipt_path: fileName,
          status: 'pending',
          amount: selectedPlan.price,
          duration: selectedPlan.duration,
          listings_per_month: selectedPlan.listingsPerMonth
        }]);

      if (dbError) {
        setError('Failed to submit upgrade request. Please try again.');
        return;
      }

      setLocalSuccess(true);
      setReceipt(null);
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
      setSelectedPlan(null);
      setTimeout(() => setLocalSuccess(false), 4000);

    } catch (err) {
      setError('Failed to submit upgrade request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg mx-auto border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gold-500 flex items-center">
        <div className="w-1 h-5 bg-yellow-400 rounded-full mr-2"></div>
        <span className="text-gray-800">Upgrade to Pro</span>
      </h2>

      {rejectionMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-center">
          {rejectionMessage}
        </div>
      )}

      <div className="space-y-6">
        {pricingPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border border-gray-200 rounded-xl p-6 cursor-pointer transition-all bg-gray-50 shadow-sm ${selectedPlan?.id === plan.id ? 'border-yellow-500 ring-2 ring-yellow-200' : 'hover:border-yellow-400 hover:bg-yellow-50'}`}
            onClick={() => handlePlanSelect(plan)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-500">{plan.price} ETB</div>
                <div className="text-sm text-gray-500">per {plan.duration}</div>
              </div>
            </div>
            <div className="text-gray-600 mb-4">
              <span className="font-medium">Up to {plan.listingsPerMonth} listings per month</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-400 hover:text-white font-semibold py-2 rounded-lg transition-all shadow-sm"
              onClick={() => handlePlanSelect(plan)}
            >
              {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Success Message */}
      {localSuccess && (
        <div className="my-8 p-6 bg-green-50 border border-green-300 text-green-800 rounded-xl text-center shadow">
          <div className="flex flex-col items-center justify-center">
            <Check className="h-8 w-8 mb-2 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
            <p>Your upgrade request has been submitted. We'll review your payment receipt and upgrade your account within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Pending State */}
      {subscriptionStatus === 'pending' && (
        <div className="my-8 p-6 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-center shadow">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 mb-2 animate-spin text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Upgrade Request Pending</h3>
            <p>Your upgrade request is pending. Please wait for admin approval.</p>
          </div>
        </div>
      )}

      {/* Upload Receipt Dialog */}
      <Dialog open={!!selectedPlan && !localSuccess && subscriptionStatus !== 'pending'} onOpenChange={(open) => { if (!open) { setSelectedPlan(null); removeReceipt(); } }}>
        <DialogContent className="max-w-md w-full sm:max-w-lg p-0 overflow-y-auto max-h-[90vh]">
          <div className="p-6">
            <h3 className="font-semibold mb-2 text-lg text-gray-900">Upload Payment Receipt</h3>
            <div className="text-gray-600 mb-4">
              <div>Price: {selectedPlan?.price} ETB</div>
              <div>Duration: {selectedPlan?.duration}</div>
              <div>Listings: {selectedPlan?.listingsPerMonth} per month</div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <input
                type="file"
                id="receipt"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleReceiptChange}
                disabled={isSubmitting}
                style={{ display: 'none' }}
              />
              {receipt ? (
                <div className="flex flex-col items-center justify-center min-h-[120px]">
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Receipt preview" className="max-h-40 rounded mb-2" />
                  ) : (
                    <div className="text-xs text-gray-500 mb-2">PDF file selected</div>
                  )}
                  <div className="flex items-center space-x-2 text-center mb-4">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm break-all max-w-[200px]">{receipt.name}</span>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="p-2 hover:bg-red-500/10 rounded-full flex-shrink-0 touch-manipulation"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="text-xs text-blue-500 text-center mb-1">
                    Debug: {receipt.type || 'unknown type'}, {Math.round(receipt.size / 1024)} KB
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    File selected successfully
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="receipt"
                  className="flex flex-col items-center justify-center min-h-[120px] cursor-pointer touch-manipulation bg-white hover:bg-gray-100 rounded-lg border border-dashed border-gray-300 p-4 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-3" />
                  <span className="text-sm text-gray-500 text-center mb-2">
                    Tap to upload receipt (image or PDF, max 15MB)
                  </span>
                </label>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            {!receipt && !error && (
              <div className="text-orange-500 text-xs mb-2">
                No file detected. If you tried to select a file and nothing happened, your phone or browser may not support this file type.
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => { setSelectedPlan(null); removeReceipt(); }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!receipt || isSubmitting}
                className="bg-gold-500 text-black hover:bg-gold-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-green-500" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
            <p className="text-[var(--portal-text-secondary)]">
              Your upgrade request has been submitted. We'll review your payment receipt and upgrade your account within 24 hours.
            </p>
            <Button
              className="mt-6"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradeSidebar; 