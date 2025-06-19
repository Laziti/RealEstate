import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, ImageIcon, ExternalLink, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListingCardProps {
  id: string;
  title: string;
  location?: string;
  mainImageUrl?: string;
  agentSlug?: string;
  description?: string;
  createdAt?: string;
  onViewDetails?: () => void;
}

export const createListingSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ListingCard = ({
  id,
  title,
  location,
  mainImageUrl,
  agentSlug,
  description,
  createdAt,
  onViewDetails
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
      className="group relative overflow-hidden rounded-xl border border-[var(--portal-border)] bg-[var(--portal-card-bg)] shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      {/* Image section */}
      <div className="relative w-full h-56 overflow-hidden">
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

        {/* Price tag */}
        {/* <div className="absolute bottom-4 left-4 bg-gold-500 text-black px-4 py-2 rounded-lg font-bold text-lg flex items-center shadow-lg">
          <DollarSign className="h-5 w-5 mr-1" />
          {formatCurrency(price)}
        </div> */}

        {/* Time chip */}
        {/* {timeAgo && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full flex items-center shadow-md">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {timeAgo}
          </div>
        )} */}
      </div>

      {/* Content section */}
      <div className="p-6">
        <h3 className="font-extrabold text-xl text-[var(--portal-text)] mb-3 leading-tight line-clamp-1 group-hover:text-[var(--portal-accent)] transition-colors duration-300 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-[var(--portal-accent)] flex-shrink-0" />
          {title}
        </h3>
        
        {location && (
          <div className="flex items-start mb-4 text-[var(--portal-text-secondary)]">
            <MapPin className="h-4 w-4 text-[var(--portal-accent)] mt-0.5 flex-shrink-0" />
            <span className="ml-2 text-sm line-clamp-1">{location}</span>
          </div>
        )}
        
        {shortDescription && (
          <div className="flex items-start mb-6 text-[var(--portal-text-secondary)]">
            <FileText className="h-4 w-4 text-[var(--portal-accent)] mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm line-clamp-2 leading-relaxed">{shortDescription}</p>
          </div>
        )}
        
        {onViewDetails && (
          <Button
            variant="default"
            className="w-full bg-[var(--portal-button-bg)] text-[var(--portal-button-text)] py-2.5 rounded-lg font-semibold text-base shadow-md hover:bg-[var(--portal-button-hover)] transition-colors duration-300 flex items-center justify-center"
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
