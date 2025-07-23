import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, ImageIcon, ExternalLink, Tag, FileText, Clock, Building, Home, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ListingCardProps {
  id: string;
  title: string;
  location?: string;
  mainImageUrl?: string;
  agentSlug?: string;
  description?: string;
  createdAt?: string;
  onViewDetails?: () => void;
  progressStatus?: 'excavation' | 'on_progress' | 'semi_finished' | 'fully_finished';
  bankOption?: boolean;
}

export const createListingSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const progressStatusLabels: Record<string, string> = {
  excavation: 'Excavation',
  on_progress: 'On Progress',
  semi_finished: 'Semi-finished',
  fully_finished: 'Fully Finished',
};

const ListingCard = ({
  id,
  title,
  location,
  mainImageUrl,
  agentSlug,
  description,
  createdAt,
  onViewDetails,
  progressStatus,
  bankOption
}: ListingCardProps) => {
  // Format the time ago
  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '';

  // Format the description (limit to X characters)
  const shortDescription = description ? 
    description.length > 100 ? `${description.substring(0, 100)}...` : description 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-[var(--portal-border)] bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out h-full flex flex-col"
    >
      {/* Image section */}
      <div className="relative w-full h-48 overflow-hidden">
        {mainImageUrl ? (
          <img 
            src={mainImageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--portal-bg-hover)]">
            <ImageIcon className="h-16 w-16 text-[var(--portal-text-secondary)]/30" />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Feature badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {progressStatus && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 text-xs font-medium shadow-md">
              {progressStatusLabels[progressStatus]}
            </Badge>
          )}
          
          {bankOption !== undefined && (
            <Badge className={`${bankOption ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white px-2.5 py-1 text-xs font-medium shadow-md`}>
              {bankOption ? 'Bank Option' : 'No Bank Option'}
            </Badge>
          )}
        </div>

        {/* Time chip */}
        {timeAgo && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center shadow-md">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-lg text-[var(--portal-text)] leading-tight mb-2 line-clamp-1">
          {title}
        </h3>
        
        {/* Location */}
        {location && (
          <div className="flex items-start mb-3 text-[var(--portal-text-secondary)]">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="ml-2 text-sm line-clamp-1 font-medium">{location}</span>
          </div>
        )}
        
        {/* Description */}
        {shortDescription && (
          <div className="mb-4 text-[var(--portal-text-secondary)] flex-grow">
            <p className="text-sm line-clamp-2 leading-relaxed">{shortDescription}</p>
          </div>
        )}
        
        {/* Features */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center text-xs text-[var(--portal-text-secondary)]">
            <Building className="h-3.5 w-3.5 text-gold-500 mr-1" />
            <span>Real Estate</span>
          </div>
          
          {progressStatus && (
            <div className="flex items-center text-xs text-[var(--portal-text-secondary)]">
              <Home className="h-3.5 w-3.5 text-blue-500 mr-1" />
              <span>{progressStatusLabels[progressStatus]}</span>
            </div>
          )}
          
          {bankOption && (
            <div className="flex items-center text-xs text-[var(--portal-text-secondary)]">
              <BadgeCheck className="h-3.5 w-3.5 text-green-500 mr-1" />
              <span>Bank Option</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action button - separate from content to ensure consistent positioning */}
      <div className="px-4 pb-4 mt-auto">
        {onViewDetails && (
          <Button
            variant="default"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold text-sm shadow-md transition-colors duration-300 flex items-center justify-center"
            onClick={onViewDetails}
          >
            View Details
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;
