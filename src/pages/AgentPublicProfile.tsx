import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import AgentProfileHeader from '@/components/public/AgentProfileHeader';
import ListingCard from '@/components/public/ListingCard';
import SearchBar from '@/components/public/SearchBar';
import { Loader2, Building, ChevronRight, Home, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { createSlug } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  career?: string;
  phone_number?: string;
  avatar_url?: string;
  slug?: string;
  whatsapp_link?: string;
  telegram_link?: string;
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

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  progressStatus?: string;
  bankOption?: boolean;
}

const AgentPublicProfile = () => {
  const { agentSlug } = useParams<{ agentSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  // Fetch agent profile by slug
  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      try {
        let currentAgent: AgentProfile | null = null;

        // Attempt to fetch by slug first
        const { data: profileBySlug, error: slugError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, career, phone_number, avatar_url, slug, status, whatsapp_link, telegram_link')
          .eq('slug', agentSlug)
          .maybeSingle();

        if (slugError) {
          console.error('Error fetching agent by slug:', slugError);
        }

        if (profileBySlug) {
          currentAgent = profileBySlug;
          console.log('Agent found by slug:', currentAgent);
        } else {
          // If no match by slug field, try the legacy method using name
          console.warn(`No agent found with slug: ${agentSlug}. Attempting fallback by name.`);
          const { data: profiles, error: backupError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, career, phone_number, avatar_url, status, slug, whatsapp_link, telegram_link')
            .eq('status', 'approved'); // Only search approved agents

          if (backupError) {
            console.error('Error fetching profiles for slug fallback:', backupError);
          }

          if (profiles && profiles.length > 0) {
            const matchedAgent = profiles.find(profile => {
              const fullName = `${profile.first_name} ${profile.last_name}`;
              return createSlug(fullName) === agentSlug;
            });

            if (matchedAgent) {
              currentAgent = matchedAgent;
              console.log('Agent found by name fallback:', currentAgent);
              // Update the profile with the slug for future use if it doesn't have one
              if (!matchedAgent.slug) {
                await supabase
                  .from('profiles')
                  .update({ slug: agentSlug })
                  .eq('id', matchedAgent.id);
                console.log(`Updated agent ${matchedAgent.id} with slug: ${agentSlug}`);
              }
            } else {
              console.warn('No agent found by name fallback.');
            }
          }
        }

        if (!currentAgent) {
          console.warn('No agent found, navigating to /not-found.');
          navigate('/not-found');
          return;
        }

        setAgent(currentAgent);

      } catch (error) {
        console.error('Error fetching agent profile:', error);
        setError('Error fetching agent profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentSlug, navigate]);

  // Fetch listings when agent is set
  useEffect(() => {
    const fetchListings = async () => {
      if (!agent) {
        console.log('Agent not set, skipping listings fetch.');
        return;
      }
      setLoading(true);
      console.log(`Fetching listings for agent ID: ${agent.id}`);
      try {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, price, location, city, main_image_url, description, created_at, progress_status, bank_option')
          .eq('user_id', agent.id)
          .neq('status', 'hidden')
          .order('created_at', { ascending: false });

        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
          setListings([]);
        } else {
          console.log(`Fetched ${listingsData?.length || 0} listings.`);
          setListings(listingsData as unknown as Listing[]);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [agent]);

  // Extract available cities from listings
  useEffect(() => {
    if (listings.length > 0) {
      const cities = Array.from(new Set(listings.map(listing => listing.city).filter(Boolean)));
      setAvailableCities(cities as string[]);
      console.log('Available cities for filtering:', cities);
    }
  }, [listings]);

  // Handle search and filtering
  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    
    let filtered = [...listings];

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description?.toLowerCase().includes(searchTerm) ||
        listing.location?.toLowerCase().includes(searchTerm) ||
        listing.city?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.minPrice) {
      filtered = filtered.filter(listing => listing.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(listing => listing.price <= filters.maxPrice!);
    }
    if (filters.city) {
      filtered = filtered.filter(listing => listing.city === filters.city);
    }
    if (filters.progressStatus) {
      filtered = filtered.filter(listing => listing.progress_status === filters.progressStatus);
    }
    if (filters.bankOption !== undefined) {
      filtered = filtered.filter(listing => listing.bank_option === filters.bankOption);
    }

    setFilteredListings(filtered);
    console.log(`Filtered ${filtered.length} listings from ${listings.length} total`);
  };

  // Initialize filtered listings when listings change
  useEffect(() => {
    setFilteredListings(listings);
  }, [listings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--portal-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
          <p className="text-[var(--portal-text-secondary)] animate-pulse">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const pageTitle = `${agent.first_name} ${agent.last_name} - Real Estate Listings`;
  const pageDescription = `Browse property listings by ${agent.first_name} ${agent.last_name}${agent.career ? `, ${agent.career}` : ''}`;

  const hasActiveSearch = searchQuery.trim() !== '' || Object.keys(searchFilters).some(key => 
    searchFilters[key as keyof SearchFilters] !== undefined
  );

  return (
    <div className="min-h-screen bg-[var(--portal-bg)] text-[var(--portal-text)]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      
      {/* Static Cover */}
      <div className="w-full h-48 md:h-64 relative overflow-hidden group">
        <img 
          src="/Cover-page.png"
          alt="Agent Profile Cover" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/40">
          {/* Optional: Add a subtle overlay or text here if desired */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 -mt-16 md:-mt-24">
        <div className="max-w-7xl mx-auto">
          {/* Agent Profile Header */}
          <div className="mb-12 relative z-20">
            <AgentProfileHeader 
              firstName={agent.first_name}
              lastName={agent.last_name}
              career={agent.career}
              phoneNumber={agent.phone_number}
              avatarUrl={agent.avatar_url}
              whatsappLink={agent.whatsapp_link}
              telegramLink={agent.telegram_link}
            />
          </div>
          
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-12"
          >
            <Card className="bg-[var(--portal-card-bg)] border-[var(--portal-border)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gold-500">Search Properties</CardTitle>
                <p className="text-[var(--portal-text-secondary)]">
                  Find the perfect property from {agent.first_name}'s listings
                </p>
              </CardHeader>
              <CardContent>
                <SearchBar
                  onSearch={handleSearch}
                  availableCities={availableCities}
                  placeholder={`Search ${agent.first_name}'s properties...`}
                />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Listings Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="h-10 w-1 bg-gold-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gold-500">
                  {hasActiveSearch ? 'Search Results' : `Properties Listed by ${agent.first_name}`}
                </h2>
              </div>
              {hasActiveSearch && (
                <div className="text-[var(--portal-text-secondary)]">
                  {filteredListings.length} of {listings.length} properties
                </div>
              )}
            </div>
            
            <AnimatePresence>
              {listings.length > 0 ? (
                filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index % 3), duration: 0.4 }}
                      >
                        <ListingCard 
                          id={listing.id}
                          title={listing.title}
                          location={listing.location}
                          mainImageUrl={listing.main_image_url}
                          agentSlug={agentSlug}
                          description={listing.description}
                          createdAt={listing.created_at}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 bg-[var(--portal-card-bg)] rounded-xl border border-[var(--portal-border)] text-center"
                  >
                    <Building className="h-16 w-16 text-[var(--portal-text-secondary)]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gold-500">No Properties Found</h3>
                    <p className="text-[var(--portal-text-secondary)] max-w-md mx-auto">
                      No properties match your search criteria. Try adjusting your filters or search terms.
                    </p>
                  </motion.div>
                )
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 bg-[var(--portal-card-bg)] rounded-xl border border-[var(--portal-border)] text-center"
                >
                  <Building className="h-16 w-16 text-[var(--portal-text-secondary)]/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gold-500">No Active Listings</h3>
                  <p className="text-[var(--portal-text-secondary)] max-w-md mx-auto">
                    This agent has no active listings at the moment. Please check back later or contact them directly for more information.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Contact Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-gradient-to-br from-[var(--portal-card-bg)] to-[var(--portal-card-bg)]/80 border border-[var(--portal-border)] rounded-xl p-8 text-center shadow-lg mb-12"
          >
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Phone className="h-8 w-8 text-gold-500" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-3 text-gold-500">Interested in these properties?</h3>
              <p className="mb-6 text-[var(--portal-text-secondary)]">
                Contact {agent.first_name} directly for more information about any of the properties or to schedule a viewing.
              </p>
              
              {agent.phone_number && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gold-500 hover:bg-gold-600 text-black py-6 px-8 rounded-xl font-semibold text-lg shadow-lg">
                    <Phone className="h-5 w-5 mr-3" />
                    Call {agent.first_name} at {agent.phone_number}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AgentPublicProfile;