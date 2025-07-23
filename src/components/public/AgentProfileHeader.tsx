import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Briefcase, Award, Calendar, MessageCircle, Send, Building2, BadgeCheck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ListingCategory {
  id: string;
  label: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location?: string;
  city?: string;
  main_image_url?: string;
  description?: string;
  created_at?: string;
  progress_status?: 'excavation' | 'on_progress' | 'semi_finished' | 'fully_finished';
  bank_option?: boolean;
}

interface AgentProfileHeaderProps {
  firstName: string;
  lastName: string;
  career?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  description?: string;
  experience?: string;
  email?: string;
  location?: string;
  whatsappLink?: string;
  telegramLink?: string;
  listings?: Listing[];
}

const progressStatusLabels: Record<string, string> = {
  excavation: 'Excavation',
  on_progress: 'On Progress',
  semi_finished: 'Semi-finished',
  fully_finished: 'Fully Finished',
};

const priceRanges = [
  { id: 'lt1m', label: '< 1M ETB', min: 0, max: 1_000_000 },
  { id: '1m-3m', label: '1M - 3M ETB', min: 1_000_000, max: 3_000_000 },
  { id: '3m-5m', label: '3M - 5M ETB', min: 3_000_000, max: 5_000_000 },
  { id: '5m-10m', label: '5M - 10M ETB', min: 5_000_000, max: 10_000_000 },
  { id: 'gt10m', label: '> 10M ETB', min: 10_000_000, max: Infinity },
];

const AgentProfileHeader = ({
  firstName,
  lastName,
  career,
  phoneNumber,
  avatarUrl,
  description,
  experience,
  email,
  location,
  whatsappLink,
  telegramLink,
  listings = [],
}: AgentProfileHeaderProps) => {
  // Default description if none provided
  const agentDescription = description || `${firstName} ${lastName} is a trusted real estate agent specializing in finding the perfect properties for clients.`;

  // Extract unique cities
  const cities = Array.from(new Set(listings.map(l => l.city).filter(Boolean)));
  // Extract unique progress statuses
  const progressStatuses = Array.from(new Set(listings.map(l => l.progress_status).filter(Boolean)));
  // Bank options
  const hasBankOption = listings.some(l => l.bank_option);
  const hasNoBankOption = listings.some(l => l.bank_option === false);
  // Price range categories present in listings
  const priceRangeIds = new Set<string>();
  listings.forEach(l => {
    const range = priceRanges.find(r => l.price >= r.min && l.price < r.max);
    if (range) priceRangeIds.add(range.id);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--portal-border)] bg-white shadow-lg"
    >
      <div className="relative z-10 px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative flex-shrink-0"
          >
            {/* Properties count badge */}
            <Badge className="absolute -top-2 -right-2 z-20 bg-red-500 text-white border-2 border-white px-3 py-1.5 text-sm font-bold shadow-lg">
              {listings.length} {listings.length === 1 ? 'Property' : 'Properties'}
            </Badge>
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[var(--portal-bg-hover)]">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={`${firstName} ${lastName}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-red-500 text-4xl font-bold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </div>
              )}
              
              {/* Verified badge */}
              <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1.5 rounded-full text-xs font-bold shadow-lg">
                <BadgeCheck className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
          
          {/* Info Section */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--portal-text)]">
                      {firstName} {lastName}
                    </h1>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[var(--portal-text-secondary)]">
                    {career && (
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <Briefcase className="h-4 w-4 text-gold-500" />
                        <span>{career}</span>
                      </div>
                    )}
                    {experience && (
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-gold-500" />
                        <span>{experience}</span>
                      </div>
                    )}
                    {location && (
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-gold-500" />
                        <span>{location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Button variant="outline" size="sm" className="bg-white hover:bg-gray-100 border border-gray-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-[var(--portal-text-secondary)] mb-4 max-w-3xl"
              >
                {agentDescription}
              </motion.p>
              
              {/* Contact buttons */}
              {phoneNumber && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="bg-white border-red-200 hover:bg-red-50 text-red-700">
                    <Phone className="h-4 w-4 mr-2 text-red-500" />
                    {phoneNumber}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Stats Section */}
        {listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200"
          >
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 2H9C7.897 2 7 2.897 7 4V20C7 21.103 7.897 22 9 22H19C20.103 22 21 21.103 21 20V4C21 2.897 20.103 2 19 2ZM19 20H9V4H19V20Z" fill="#E53E3E"/>
                  <path d="M16 10H12V12H16V10Z" fill="#E53E3E"/>
                  <path d="M16 14H12V16H16V14Z" fill="#E53E3E"/>
                  <path d="M16 6H12V8H16V6Z" fill="#E53E3E"/>
                  <path d="M5 14H3V20C3 21.103 3.897 22 5 22H11V20H5V14Z" fill="#E53E3E"/>
                </svg>
              </div>
              <p className="text-sm text-[var(--portal-text-secondary)]">Total Properties</p>
              <p className="text-2xl font-bold text-[var(--portal-text)]">{listings.length}</p>
            </div>
            
            {cities.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#E53E3E"/>
                  </svg>
                </div>
                <p className="text-sm text-[var(--portal-text-secondary)]">Locations</p>
                <p className="text-2xl font-bold text-[var(--portal-text)]">{cities.length}</p>
              </div>
            )}
            
            {progressStatuses.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="#3182CE"/>
                  </svg>
                </div>
                <p className="text-sm text-[var(--portal-text-secondary)]">Project Stages</p>
                <p className="text-2xl font-bold text-[var(--portal-text)]">{progressStatuses.length}</p>
              </div>
            )}
            
            {(hasBankOption || hasNoBankOption) && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5V6H21V5L12 1Z" fill="#38A169"/>
                    <path d="M5 7V19H7V7H5Z" fill="#38A169"/>
                    <path d="M9 7V19H11V7H9Z" fill="#38A169"/>
                    <path d="M13 7V19H15V7H13Z" fill="#38A169"/>
                    <path d="M17 7V19H19V7H17Z" fill="#38A169"/>
                    <path d="M3 20V22H21V20H3Z" fill="#38A169"/>
                  </svg>
                </div>
                <p className="text-sm text-[var(--portal-text-secondary)]">Bank Options</p>
                <p className="text-2xl font-bold text-[var(--portal-text)]">{hasBankOption ? "Available" : "None"}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentProfileHeader;
