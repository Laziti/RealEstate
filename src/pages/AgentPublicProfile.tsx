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

  // Helper to toggle a filter value
  function toggleFilter(key, value) {
    setSearchFilters(prev => {
      let next = { ...prev };
      if (key === 'city') {
        next.city = prev.city === value ? undefined : value;
      } else if (key === 'progressStatus') {
        next.progressStatus = prev.progressStatus === value ? undefined : value;
      } else if (key === 'bankOption') {
        next.bankOption = prev.bankOption === value ? undefined : value;
      } else if (key === 'priceRange') {
        if (prev.minPrice === value.min && prev.maxPrice === value.max) {
          next.minPrice = undefined;
          next.maxPrice = undefined;
        } else {
          next.minPrice = value.min;
          next.maxPrice = value.max;
        }
      }
      return next;
    });
  }

  // Update filtered listings when searchFilters or listings change
  useEffect(() => {
    let filtered = [...listings];
    if (searchFilters.city) {
      filtered = filtered.filter(l => l.city === searchFilters.city);
    }
    if (searchFilters.progressStatus) {
      filtered = filtered.filter(l => l.progress_status === searchFilters.progressStatus);
    }
    if (searchFilters.bankOption !== undefined) {
      filtered = filtered.filter(l => l.bank_option === searchFilters.bankOption);
    }
    if (searchFilters.minPrice !== undefined && searchFilters.maxPrice !== undefined) {
      filtered = filtered.filter(l => l.price >= searchFilters.minPrice && l.price < searchFilters.maxPrice);
    }
    setFilteredListings(filtered);
  }, [searchFilters, listings]);

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
          <div className="mb-4 relative z-20">
            <AgentProfileHeader 
              firstName={agent.first_name}
              lastName={agent.last_name}
              career={agent.career}
              phoneNumber={agent.phone_number}
              avatarUrl={agent.avatar_url}
              whatsappLink={agent.whatsapp_link}
              telegramLink={agent.telegram_link}
              listings={listings}
            />
          </div>

          {/* Responsive, functional category bar */}
          <div className="mb-8 space-y-3">
            {/* Places */}
            {availableCities.length > 0 && (
              <div>
                <div className="font-semibold mb-1 text-[var(--portal-text)]">Places</div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-200/40">
                  {availableCities.map(city => (
                    <button
                      key={city}
                      className={`whitespace-nowrap px-4 py-2 rounded-full border font-medium shadow-sm transition cursor-pointer ${searchFilters.city === city ? 'bg-red-500 text-white border-red-500' : 'bg-[var(--portal-bg-hover)] border-[var(--portal-border)] text-[var(--portal-text)] hover:bg-red-100'}`}
                      onClick={() => toggleFilter('city', city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Progress Status */}
            {listings.length > 0 && (() => {
              const progressStatuses = Array.from(new Set(listings.map(l => l.progress_status).filter(Boolean)));
              return progressStatuses.length > 0 ? (
                <div>
                  <div className="font-semibold mb-1 text-[var(--portal-text)]">Progress</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-200/40">
                    {progressStatuses.map(status => (
                      <button
                        key={status as string}
                        className={`whitespace-nowrap px-4 py-2 rounded-full border font-medium shadow-sm transition cursor-pointer ${searchFilters.progressStatus === status ? 'bg-red-500 text-white border-red-500' : 'bg-[var(--portal-bg-hover)] border-[var(--portal-border)] text-[var(--portal-text)] hover:bg-red-100'}`}
                        onClick={() => toggleFilter('progressStatus', status)}
                      >
                        {progressStatusLabels[status as string] || status}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            {/* Bank Option */}
            {listings.length > 0 && (() => {
              const hasBankOption = listings.some(l => l.bank_option);
              const hasNoBankOption = listings.some(l => l.bank_option === false);
              return (hasBankOption || hasNoBankOption) ? (
                <div>
                  <div className="font-semibold mb-1 text-[var(--portal-text)]">Bank Option</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-200/40">
                    {hasBankOption && (
                      <button
                        className={`whitespace-nowrap px-4 py-2 rounded-full border font-medium shadow-sm transition cursor-pointer ${searchFilters.bankOption === true ? 'bg-red-500 text-white border-red-500' : 'bg-[var(--portal-bg-hover)] border-[var(--portal-border)] text-[var(--portal-text)] hover:bg-red-100'}`}
                        onClick={() => toggleFilter('bankOption', true)}
                      >
                        Available
                      </button>
                    )}
                    {hasNoBankOption && (
                      <button
                        className={`whitespace-nowrap px-4 py-2 rounded-full border font-medium shadow-sm transition cursor-pointer ${searchFilters.bankOption === false ? 'bg-red-500 text-white border-red-500' : 'bg-[var(--portal-bg-hover)] border-[var(--portal-border)] text-[var(--portal-text)] hover:bg-red-100'}`}
                        onClick={() => toggleFilter('bankOption', false)}
                      >
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            {/* Price Ranges */}
            {listings.length > 0 && (() => {
              const priceRangeIds = new Set<string>();
              listings.forEach(l => {
                const range = priceRanges.find(r => l.price >= r.min && l.price < r.max);
                if (range) priceRangeIds.add(range.id);
              });
              return priceRangeIds.size > 0 ? (
                <div>
                  <div className="font-semibold mb-1 text-[var(--portal-text)]">Prices</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-200/40">
                    {priceRanges.filter(r => priceRangeIds.has(r.id)).map(range => (
                      <button
                        key={range.id}
                        className={`whitespace-nowrap px-4 py-2 rounded-full border font-medium shadow-sm transition cursor-pointer ${(searchFilters.minPrice === range.min && searchFilters.maxPrice === range.max) ? 'bg-red-500 text-white border-red-500' : 'bg-[var(--portal-bg-hover)] border-[var(--portal-border)] text-[var(--portal-text)] hover:bg-red-100'}`}
                        onClick={() => toggleFilter('priceRange', { min: range.min, max: range.max })}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
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
                  onSearch={() => {}}
                  availableCities={availableCities}
                  placeholder={`Search ${agent.first_name}'s properties...`}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        {/* Show only filtered listings */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gold-500">Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing, index) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={listing.location}
                  mainImageUrl={listing.main_image_url}
                  agentSlug={agent.slug}
                  description={listing.description}
                  createdAt={listing.created_at}
                  onViewDetails={() => navigate(`/${agent.slug}/listing/${createSlug(listing.title)}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-[var(--portal-text-secondary)]">No listings found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPublicProfile;