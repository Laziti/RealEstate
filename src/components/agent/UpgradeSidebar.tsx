import React, { useState } from 'react';
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
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowUploadDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
      setError(null);
    }
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
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Create subscription request record
      const { data: insertData, error: dbError } = await supabase
        .from('subscription_requests')
        .insert([{
          user_id: user.id,
          plan_id: PLAN_ID_MAP[selectedPlan.id],
          receipt_path: fileName,
          status: 'pending',
          amount: selectedPlan.price,
          duration: selectedPlan.duration,
          listings_per_month: selectedPlan.listingsPerMonth
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to submit upgrade request. Please try again.');
        return;
      }

      console.log('Successfully created subscription request:', insertData);

      setShowUploadDialog(false);
      setShowSuccessDialog(true);
      setReceipt(null);

      // Update user profile
      // Set end date to one month in the future for monthly plans
      const newEndDate = new Date();
      if (selectedPlan.duration.toLowerCase().includes('month')) {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (selectedPlan.duration.toLowerCase().includes('year')) {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      } else if (selectedPlan.duration.toLowerCase().includes('6')) {
        newEndDate.setMonth(newEndDate.getMonth() + 6);
      }
      const details = {
        subscription_status: 'pro',
        subscription_end_date: newEndDate.toISOString(),
        subscription_details: {
          plan_id: PLAN_ID_MAP[selectedPlan.id],
          price: selectedPlan.price,
          duration: selectedPlan.duration,
          listings_per_month: selectedPlan.listingsPerMonth,
          end_date: newEndDate.toISOString(),
          start_date: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'pro', subscription_end_date: newEndDate, subscription_details: details })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        setError('Failed to update user profile. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting upgrade request:', err);
      setError('Failed to submit upgrade request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--portal-card-bg)] border border-[var(--portal-border)] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-gold-500 flex items-center">
        <div className="w-1 h-5 bg-gold-500 rounded-full mr-2"></div>
        Upgrade to Pro
      </h2>

      <div className="space-y-4">
        {pricingPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border border-[var(--portal-border)] rounded-lg p-4 cursor-pointer hover:border-gold-500 transition-all"
            onClick={() => handlePlanSelect(plan)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="text-right">
                <div className="text-xl font-bold text-gold-500">{plan.price} ETB</div>
                <div className="text-sm text-[var(--portal-text-secondary)]">per {plan.duration}</div>
              </div>
            </div>
            <div className="text-[var(--portal-text-secondary)] mb-3">
              Up to {plan.listingsPerMonth} listings per month
            </div>
            <Button
              variant="outline"
              className="w-full border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black transition-all"
              onClick={() => handlePlanSelect(plan)}
            >
              Select Plan
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Receipt Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[var(--portal-bg)]/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{selectedPlan?.name}</h3>
              <div className="text-[var(--portal-text-secondary)]">
                <div>Price: {selectedPlan?.price} ETB</div>
                <div>Duration: {selectedPlan?.duration}</div>
                <div>Listings: {selectedPlan?.listingsPerMonth} per month</div>
              </div>
            </div>

            <div className="border-2 border-dashed border-[var(--portal-border)] rounded-lg p-6">
              <input
                type="file"
                id="receipt"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="receipt"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {receipt ? (
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{receipt.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setReceipt(null);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded-full"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[var(--portal-text-secondary)] mb-2" />
                    <span className="text-sm text-[var(--portal-text-secondary)]">
                      Click to upload receipt
                    </span>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
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