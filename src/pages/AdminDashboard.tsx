import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Users, DollarSign, Clock, BarChart3 } from 'lucide-react';

// Mock data for demonstration
const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 150 },
  { month: 'Mar', users: 200 },
  { month: 'Apr', users: 250 },
  { month: 'May', users: 300 },
  { month: 'Jun', users: 400 },
];

const listingsByCategory = [
  { name: 'Residential', value: 300 },
  { name: 'Commercial', value: 120 },
  { name: 'Land', value: 80 },
  { name: 'Other', value: 40 },
];

const statCards = [
  {
    title: 'New Users This Month',
    value: 45,
    icon: <Users className="h-6 w-6 text-[var(--portal-accent)]" />,
  },
  {
    title: 'Pending Payments',
    value: 7,
    icon: <Clock className="h-6 w-6 text-[var(--portal-warning)]" />,
  },
  {
    title: 'Revenue',
    value: '$12,500',
    icon: <DollarSign className="h-6 w-6 text-[var(--portal-success)]" />,
  },
];

const pieColors = [
  'var(--portal-accent)',
  'var(--portal-success)',
  'var(--portal-warning)',
  '#8884d8',
];

const AdminDashboard = () => {
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
                  {/* Listings by Category Pie Chart */}
                  <Card className="flex-1 bg-white border-[var(--portal-border)] shadow-none p-4">
                    <CardHeader className="p-0 mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[var(--portal-accent)]" />
                        <CardTitle className="text-base font-semibold text-[var(--portal-text)]">Listings by Category</CardTitle>
                      </div>
                      <CardDescription className="text-[var(--portal-text-secondary)]">Distribution of listings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={listingsByCategory}
                              dataKey="value"
                              nameKey="name"
                              cx="40%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {listingsByCategory.map((entry, index) => (
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
