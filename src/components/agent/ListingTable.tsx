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
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import ListingDetailCard from './ListingDetailCard';

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium overflow-hidden">
                    <div className="flex items-center">
                      {listing.main_image_url ? (
                        <img 
                          src={listing.main_image_url} 
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[var(--portal-highlight)] rounded-md mr-3 flex items-center justify-center text-[var(--portal-text-secondary)] flex-shrink-0">
                          No img
                        </div>
                      )}
                      <span className="font-medium text-[var(--portal-text)] truncate max-w-[150px]">{listing.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--portal-text)]">
                    {listing.price ? formatCurrency(listing.price) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-[var(--portal-text)]">
                    {listing.location || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status || 'pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <span className="text-sm text-[var(--portal-text-secondary)]">
                        {listing.edit_count >= 2 ? (
                          'No edits left'
                        ) : (
                          `${2 - (listing.edit_count || 0)} edits left`
                        )}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setSelectedListing(listing)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => onEdit(listing.id)}
                        disabled={listing.edit_count >= 2}
                        className={listing.edit_count >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
