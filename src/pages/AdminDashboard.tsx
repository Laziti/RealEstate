import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, List, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'user_registered' | 'payment_pending' | 'listing_created' | 'user_approved';
  title: string;
  description: string;
  date: string;
  priority?: 'low' | 'medium' | 'high';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total listings
        const { count: listingsCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true });

        // Fetch recent activities
        const { data: recentActivities } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalUsers: usersCount || 0,
          totalListings: listingsCount || 0,
          recentActivities: recentActivities || []
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full md:pl-72">
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="bg-white min-h-screen flex flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center">
                  <SidebarTrigger />
                  <h1 className="ml-4 text-xl font-semibold text-black">Dashboard Overview</h1>
                </div>
              </div>
              <div className="p-6 space-y-6 overflow-auto flex-1">
                {/* Analytics Cards */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-black">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gold-500 mr-2" />
                          <div className="text-2xl font-bold text-black">
                            {loading ? "..." : stats.totalUsers}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-black">Total Listings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <List className="h-5 w-5 text-gold-500 mr-2" />
                          <div className="text-2xl font-bold text-black">
                            {loading ? "..." : stats.totalListings}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-black">Recent Activity</CardTitle>
                          <CardDescription className="text-gray-700">
                            Latest updates from your platform
                          </CardDescription>
                        </div>
                        <Bell className="h-5 w-5 text-gray-700" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-4 text-gray-700">Loading activities...</div>
                      ) : stats.recentActivities.length === 0 ? (
                        <div className="text-center py-4 text-gray-700">No recent activities</div>
                      ) : (
                        <div className="space-y-4">
                          {stats.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg transition-colors hover:bg-[var(--portal-bg-hover)]">
                              <div className={`w-2 h-2 mt-2 rounded-full ${
                                activity.type === 'user_registered' ? 'bg-blue-500' :
                                activity.type === 'payment_pending' ? 'bg-amber-500' :
                                activity.type === 'listing_created' ? 'bg-emerald-500' :
                                'bg-gold-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-black">{activity.title}</p>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                                <p className="text-xs text-gray-700 mt-1">{formatDate(activity.date)}</p>
                              </div>
                              {activity.priority && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                  activity.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                                  'bg-emerald-500/10 text-emerald-600'
                                }`}>
                                  {activity.priority}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
