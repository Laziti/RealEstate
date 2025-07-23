import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Building,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  Home
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const DashboardContent = ({ listings, profile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0
  });
  const [listingsByMonth, setListingsByMonth] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [listingTypes, setListingTypes] = useState({
    rent: 0,
    sale: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      if (!listings || !user) return;
      
      try {
        setLoading(true);
        
        // Calculate stats from listings
        const activeListings = listings.filter(listing => listing.status === 'active');
        
        // Calculate monthly listings
        const monthly = calculateMonthlyListings(listings);
        
        // Calculate total views (simulated for now)
        const totalViews = listings.reduce((sum, listing) => sum + Math.floor(Math.random() * 50), 0);
        
        // Calculate listing types (simulated - in a real app, this would come from actual data)
        const forRent = Math.floor(listings.length * 0.4); // 40% for rent
        const forSale = listings.length - forRent; // 60% for sale
        
        setStats({
          totalListings: listings.length,
          activeListings: activeListings.length,
          totalViews: totalViews
        });
        
        setListingTypes({
          rent: forRent,
          sale: forSale
        });
        
        setListingsByMonth(monthly);
        setLoading(false);

        // Trigger chart animation after data is loaded
        setTimeout(() => setIsChartVisible(true), 300);
      } catch (error) {
        console.error('Error calculating stats:', error);
        setLoading(false);
      }
    };
    
    calculateStats();
  }, [listings, user]);

  // Function to calculate monthly listings
  const calculateMonthlyListings = (listings) => {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Initialize data for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, index) => {
      return {
        month,
        count: 0,
        percentChange: 0
      };
    });
    
    // Count listings by month
    listings.forEach(listing => {
      const createdDate = new Date(listing.created_at);
      if (createdDate.getFullYear() === currentYear) {
        const month = createdDate.getMonth();
        monthlyData[month].count++;
      }
    });
    
    // Calculate percentage changes
    for (let i = 1; i < monthlyData.length; i++) {
      const prevCount = monthlyData[i-1].count;
      const currentCount = monthlyData[i].count;
      
      if (prevCount > 0) {
        monthlyData[i].percentChange = Math.round(((currentCount - prevCount) / prevCount) * 100);
      } else if (currentCount > 0) {
        monthlyData[i].percentChange = 100; // If previous was 0 and current is not, it's a 100% increase
      }
    }
    
    return monthlyData;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-10 w-28 mb-2" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message - Hidden on mobile */}
      <div className="bg-[var(--portal-card-bg)] p-6 rounded-xl border border-[var(--portal-border)] shadow-sm hidden md:block">
        <h2 className="text-2xl font-bold text-[var(--portal-text)]">
          Welcome back, {profile?.first_name || user?.email?.split('@')[0] || 'Agent'}!
        </h2>
        <p className="text-[var(--portal-text-secondary)] mt-1">
          Here's an overview of your property listings
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Listings */}
        <Card className="p-6 border border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--portal-text-secondary)] text-sm font-medium mb-1">Total Listings</p>
              <h3 className="text-3xl font-bold text-[var(--portal-text)]">{stats.totalListings}</h3>
            </div>
            <div className="p-3 bg-[var(--portal-accent)]/10 rounded-lg">
              <Building className="h-6 w-6 text-[var(--portal-accent)]" />
            </div>
          </div>
        </Card>
        
        {/* Active Listings */}
        <Card className="p-6 border border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--portal-text-secondary)] text-sm font-medium mb-1">Active Listings</p>
              <h3 className="text-3xl font-bold text-[var(--portal-text)]">{stats.activeListings}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
        
        {/* Listing Types */}
        <Card className="p-6 border border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--portal-text-secondary)] text-sm font-medium mb-1">For Sale / Rent</p>
              <h3 className="text-3xl font-bold text-[var(--portal-text)]">{listingTypes.sale}/{listingTypes.rent}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Listings by Month Chart */}
      <Card className="p-6 border border-[var(--portal-border)] bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--portal-accent)]/80 to-[var(--portal-accent)] mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--portal-text)]">
              Listings by Month
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center px-3 py-1.5 bg-[var(--portal-accent)]/10 rounded-full">
              <span className="text-[var(--portal-accent)] font-medium">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
        
        {/* 3D Bar Chart with Animation */}
        <div className="relative h-[350px] mt-4 perspective-[1000px]">
          {/* Background grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 w-full h-0"></div>
              ))}
            </div>
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-10 w-10 flex flex-col justify-between text-xs text-gray-500 font-medium">
            <div>{Math.max(...listingsByMonth.map(m => m.count), 5)}</div>
            <div>{Math.round(Math.max(...listingsByMonth.map(m => m.count), 5) * 0.75)}</div>
            <div>{Math.round(Math.max(...listingsByMonth.map(m => m.count), 5) * 0.5)}</div>
            <div>{Math.round(Math.max(...listingsByMonth.map(m => m.count), 5) * 0.25)}</div>
            <div>0</div>
          </div>
          
          {/* Chart Area */}
          <div className="absolute left-12 right-0 top-0 bottom-10 flex items-end justify-around">
            <motion.div 
              className="flex items-end justify-around w-full h-full"
              initial={{ opacity: 0, rotateX: 45 }}
              animate={isChartVisible ? { opacity: 1, rotateX: 15 } : { opacity: 0, rotateX: 45 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {listingsByMonth.map((data, index) => {
                // Calculate height based on value
                const maxValue = Math.max(...listingsByMonth.map(m => m.count), 5);
                const heightPercent = maxValue > 0 ? (data.count / maxValue) * 100 : 0;
                const isSelected = selectedBar === index;
                
                return (
                  <motion.div 
                    key={index}
                    className="group relative mx-1"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedBar(isSelected ? null : index)}
                  >
                    {/* 3D Bar */}
                    <motion.div 
                      className={`w-12 md:w-16 rounded-t-md bg-gradient-to-t from-[var(--portal-accent)]/70 to-[var(--portal-accent)] relative cursor-pointer shadow-lg`}
                      style={{ 
                        height: `${Math.max(heightPercent, 2)}%`,
                        transformStyle: 'preserve-3d',
                        transform: isSelected ? 'translateZ(20px)' : 'translateZ(0)'
                      }}
                      animate={{ 
                        height: `${Math.max(heightPercent, 2)}%`,
                        scale: isSelected ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-t-md"></div>
                      
                      {/* Side faces for 3D effect */}
                      <div 
                        className="absolute top-0 -right-1 h-full w-1 bg-black/20"
                        style={{ transform: 'translateX(100%) rotateY(90deg)', transformOrigin: 'left' }}
                      ></div>
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-black/20"
                        style={{ transform: 'translateY(100%) rotateX(90deg)', transformOrigin: 'top' }}
                      ></div>
                      
                      {/* Value on top */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--portal-accent)] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count}
                      </div>
                      
                      {/* Percentage change indicator */}
                      {data.percentChange !== 0 && (
                        <div className={`absolute -right-3 top-0 flex items-center ${data.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.percentChange > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span className="text-[10px] font-bold">{Math.abs(data.percentChange)}%</span>
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Month label */}
                    <div className="text-xs text-center mt-2 font-medium text-gray-600">
                      {data.month}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          
          {/* X-axis */}
          <div className="absolute left-10 right-0 bottom-0 h-[1px] bg-gray-300"></div>
        </div>
        
        {/* Selected month details */}
        {selectedBar !== null && (
          <motion.div 
            className="mt-6 p-4 bg-[var(--portal-accent)]/5 rounded-lg border border-[var(--portal-accent)]/20 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-[var(--portal-text)]">
                  {listingsByMonth[selectedBar].month} {new Date().getFullYear()}
                </h4>
                <p className="text-sm text-[var(--portal-text-secondary)]">
                  {listingsByMonth[selectedBar].count} listing{listingsByMonth[selectedBar].count !== 1 ? 's' : ''} created
                </p>
              </div>
              {listingsByMonth[selectedBar].percentChange !== 0 && (
                <div className="flex items-center">
                  <span className={`text-sm font-semibold ${listingsByMonth[selectedBar].percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {listingsByMonth[selectedBar].percentChange >= 0 ? '+' : ''}{listingsByMonth[selectedBar].percentChange}%
                  </span>
                  <span className="text-[var(--portal-text-secondary)] text-sm ml-1">vs prev month</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Listings Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-[var(--portal-accent)]/5">
            <span className="text-sm font-medium text-[var(--portal-text)]">Avg. Monthly</span>
            <span className="text-2xl font-bold text-[var(--portal-accent)]">
              {Math.round(listingsByMonth.reduce((sum, item) => sum + item.count, 0) / listingsByMonth.length)}
            </span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-[var(--portal-accent)]/5">
            <span className="text-sm font-medium text-[var(--portal-text)]">Best Month</span>
            <span className="text-2xl font-bold text-[var(--portal-accent)]">
              {listingsByMonth.reduce((best, item) => item.count > best.count ? item : best, { count: 0 }).month}
            </span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-[var(--portal-accent)]/5">
            <span className="text-sm font-medium text-[var(--portal-text)]">Total</span>
            <span className="text-2xl font-bold text-[var(--portal-accent)]">
              {listingsByMonth.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </div>
      </Card>
      
      {/* Listing Type Distribution */}
      <Card className="p-6 border border-[var(--portal-border)] bg-[var(--portal-card-bg)]">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-[var(--portal-accent)]/10 mr-3">
            <Home className="h-5 w-5 text-[var(--portal-accent)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--portal-text)]">
            Listing Type Distribution
          </h3>
        </div>
        
        <div className="flex items-center justify-center">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* For Sale Segment */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent"
                stroke="#e50000" 
                strokeWidth="20"
                strokeDasharray={`${(listingTypes.sale / stats.totalListings) * 251.2} 251.2`}
                transform="rotate(-90 50 50)"
              />
              
              {/* For Rent Segment */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent"
                stroke="#3b82f6" 
                strokeWidth="20"
                strokeDasharray={`${(listingTypes.rent / stats.totalListings) * 251.2} 251.2`}
                strokeDashoffset={-1 * (listingTypes.sale / stats.totalListings) * 251.2}
                transform="rotate(-90 50 50)"
              />
              
              {/* Center circle */}
              <circle cx="50" cy="50" r="30" fill="white" />
              
              {/* Total number */}
              <text x="50" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">
                {stats.totalListings}
              </text>
              <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#666">
                Total Listings
              </text>
            </svg>
          </div>
          
          <div className="ml-8">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-[var(--portal-accent)] rounded-sm mr-2"></div>
              <span className="text-sm text-[var(--portal-text)]">For Sale: {listingTypes.sale} ({Math.round((listingTypes.sale / stats.totalListings) * 100)}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-sm text-[var(--portal-text)]">For Rent: {listingTypes.rent} ({Math.round((listingTypes.rent / stats.totalListings) * 100)}%)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardContent; 