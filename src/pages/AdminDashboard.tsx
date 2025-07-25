import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Users, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const pieColors = [
  'var(--portal-accent)',
  'var(--portal-success)',
  'var(--portal-warning)',
  '#8884d8',
];

const AdminDashboard = () => {
  const [userGrowthData, setUserGrowthData] = useState<{ month: string; users: number }[]>([]);
  const [proNonProData, setProNonProData] = useState([
    { name: 'Pro Users', value: 0 },
    { name: 'Non-Pro Users', value: 0 },
  ]);
  const [statCards, setStatCards] = useState([
    { title: 'New Users This Month', value: 0, icon: <Users className="h-6 w-6 text-[var(--portal-accent)]" /> },
    { title: 'Pending Payments', value: 0, icon: <Clock className="h-6 w-6 text-[var(--portal-warning)]" /> },
    { title: 'Revenue', value: '$0', icon: <DollarSign className="h-6 w-6 text-[var(--portal-success)]" /> },
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // User Growth (last 6 months)
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      const userCounts: { [key: string]: number } = {};
      for (const month of months) userCounts[month] = 0;
      const { data: profiles } = await supabase.from('profiles').select('created_at');
      if (profiles) {
        profiles.forEach((p: any) => {
          const d = new Date(p.created_at);
          const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (userCounts[key] !== undefined) userCounts[key]++;
        });
      }
      setUserGrowthData(months.map(month => ({ month, users: userCounts[month] })));

      // Pro/Non-Pro Users
      const [{ count: proCount }, { count: freeCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'pro'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'free'),
      ]);
      setProNonProData([
        { name: 'Pro Users', value: proCount || 0 },
        { name: 'Non-Pro Users', value: freeCount || 0 },
      ]);

      // New Users This Month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);
      // Revenue and Pending Payments
      const { data: subscriptionRequests } = await supabase
        .from('subscription_requests')
        .select('amount, status');
      let revenue = 0;
      let pendingPayments = 0;
      if (subscriptionRequests) {
        for (const req of subscriptionRequests) {
          if (req.status === 'approved') revenue += req.amount;
          if (req.status === 'pending') pendingPayments++;
        }
      }
      setStatCards(cards => cards.map(card => {
        if (card.title === 'New Users This Month') return { ...card, value: newUsersThisMonth || 0 };
        if (card.title === 'Pending Payments') return { ...card, value: pendingPayments };
        if (card.title === 'Revenue') return { ...card, value: `$${revenue.toLocaleString()}` };
        return card;
      }));
    };
    fetchAnalytics();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full md:pl-72 bg-white">
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="bg-white min-h-screen flex flex-col">
              <div className="flex items-center border-b p-4">
                <SidebarTrigger />
                <h1 className="ml-4 text-xl font-semibold text-[var(--portal-text)]">Analytics Dashboard</h1>
              </div>
              <div className="p-6 flex flex-col gap-8 overflow-auto flex-1">
                {/* Stat Cards */}
                <div className="flex flex-row gap-6 w-full max-w-5xl">
                  {statCards.map((card) => (
                    <Card key={card.title} className="flex-1 bg-white border-[var(--portal-border)] shadow-none flex flex-row items-center p-4 min-w-[180px]">
                      <div className="mr-4">{card.icon}</div>
                      <div className="flex flex-col items-start">
                        <span className="text-2xl font-bold text-[var(--portal-text)]">{card.value}</span>
                        <span className="text-sm text-[var(--portal-text-secondary)] font-medium">{card.title}</span>
                      </div>
                    </Card>
                  ))}
                </div>
                {/* Charts Section */}
                <div className="flex flex-row gap-8 w-full max-w-5xl">
                  {/* User Growth Line Chart */}
                  <Card className="flex-1 bg-white border-[var(--portal-border)] shadow-none p-4">
                    <CardHeader className="p-0 mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[var(--portal-accent)]" />
                        <CardTitle className="text-base font-semibold text-[var(--portal-text)]">User Growth (6 months)</CardTitle>
                      </div>
                      <CardDescription className="text-[var(--portal-text-secondary)]">User registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userGrowthData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                            <XAxis dataKey="month" stroke="#888" tick={{ fill: 'var(--portal-text-secondary)' }} />
                            <YAxis stroke="#888" tick={{ fill: 'var(--portal-text-secondary)' }} />
                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #eee', color: 'var(--portal-text)' }} />
                            <Line type="monotone" dataKey="users" stroke="var(--portal-accent)" strokeWidth={3} dot={{ r: 5, fill: 'var(--portal-accent)' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Pro vs Non-Pro Users Pie Chart */}
                  <Card className="flex-1 bg-white border-[var(--portal-border)] shadow-none p-4">
                    <CardHeader className="p-0 mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[var(--portal-accent)]" />
                        <CardTitle className="text-base font-semibold text-[var(--portal-text)]">Pro vs Non-Pro Users</CardTitle>
                      </div>
                      <CardDescription className="text-[var(--portal-text-secondary)]">Distribution of user subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={proNonProData}
                              dataKey="value"
                              nameKey="name"
                              cx="40%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {proNonProData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                              ))}
                            </Pie>
                            <Legend align="left" verticalAlign="bottom" iconType="circle" />
                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #eee', color: 'var(--portal-text)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
