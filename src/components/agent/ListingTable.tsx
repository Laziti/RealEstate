import React, { useState } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import ListingDetailCard from './ListingDetailCard';
import ListingCard from '@/components/public/ListingCard';

interface Listing {
  id: string;
  title: string;
  price?: number;
  location?: string;
  created_at: string;
  main_image_url?: string;
  edit_count?: number;
  description?: string;
  phone_number?: string;
  whatsapp_link?: string;
  telegram_link?: string;
  status?: string;
}

interface ListingTableProps {
  listings: Listing[];
  onEdit: (id: string) => void;
}

const ListingTable = ({ listings, onEdit }: ListingTableProps) => {
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  return (
    <>
      <div className="bg-[var(--portal-card-bg)] rounded-md shadow border border-[var(--portal-border)]">
        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-[var(--portal-text)] mb-2">No listings found</h3>
            <p className="text-[var(--portal-text-secondary)] mb-4">You haven't created any listings yet.</p>
            <Button onClick={() => navigate('/agent?tab=create')}>Create Your First Listing</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {listings.map((listing) => (
              <div key={listing.id} className="block">
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  location={listing.location}
                  mainImageUrl={listing.main_image_url}
                  description={listing.description}
                  createdAt={listing.created_at}
                  onViewDetails={() => setSelectedListing(listing)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Popup */}
      {selectedListing && (
        <ListingDetailCard
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </>
  );
};

export default ListingTable;
