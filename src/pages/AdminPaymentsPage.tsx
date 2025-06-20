import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import PaymentApprovalSidebar from '@/components/admin/PaymentApprovalSidebar';

const AdminPaymentsPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full md:pl-72">
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="bg-white min-h-screen flex flex-col pb-24">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center">
                  <SidebarTrigger />
                  <h1 className="ml-4 text-xl font-semibold text-black">Payment Approvals</h1>
                </div>
              </div>
              <div className="p-6 flex-1 pb-20 md:pb-6">
                <PaymentApprovalSidebar />
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPaymentsPage; 