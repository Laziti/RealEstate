import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import AgentProfileHeader from '@/components/public/AgentProfileHeader';
import ListingCard from '@/components/public/ListingCard';
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

const AgentPublicProfile = () => {
  const { agentSlug } = useParams<{ agentSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(searchParams.get('city'));
  const [selectedProgress, setSelectedProgress] = useState<string | null>(searchParams.get('progress'));
  const [selectedBankOption, setSelectedBankOption] = useState<boolean | null>(
    searchParams.get('bank') ? searchParams.get('bank') === 'true' : null
  );
  const [availableCities, setAvailableCities] = useState<string[]>([]);

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

  useEffect(() => {
    if (listings.length > 0) {
      const cities = Array.from(new Set(listings.map(listing => listing.city).filter(Boolean)));
      setAvailableCities(cities as string[]);
      console.log('Available cities for filtering:', cities);
    }
  }, [listings]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCity) params.city = selectedCity;
    if (selectedProgress) params.progress = selectedProgress;
    if (selectedBankOption !== null) params.bank = selectedBankOption.toString();
    setSearchParams(params);
    console.log('Search params updated:', params);
  }, [selectedCity, selectedProgress, selectedBankOption, setSearchParams]);

  const filteredListings = listings.filter(listing => {
    console.log(`Filtering listing ${listing.id}: City=${listing.city}, Progress=${listing.progress_status}, BankOption=${listing.bank_option}`);
    console.log(`Selected filters: City=${selectedCity}, Progress=${selectedProgress}, BankOption=${selectedBankOption}`);

    if (selectedCity && listing.city !== selectedCity) return false;
    if (selectedProgress && listing.progress_status !== selectedProgress) return false;
    // Ensure bank_option filter correctly handles boolean values
    if (selectedBankOption !== null) {
      if (typeof listing.bank_option === 'boolean' && listing.bank_option !== selectedBankOption) return false;
      if (typeof listing.bank_option === 'undefined' && selectedBankOption === true) return false; // If listing has no bank_option, don't show if filter is true
    }
    
    return true;
  });

  const resetFilters = () => {
    setSelectedCity(null);
    setSelectedProgress(null);
    setSelectedBankOption(null);
    console.log('Filters reset.');
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(selectedCity === city ? null : city);
    console.log('City filter toggled:', city);
  };

  const handleProgressFilter = (progress: string) => {
    setSelectedProgress(selectedProgress === progress ? null : progress);
    console.log('Progress filter toggled:', progress);
  };

  const handleBankOptionFilter = (hasBank: boolean) => {
    setSelectedBankOption(selectedBankOption === hasBank ? null : hasBank);
    console.log('Bank option filter toggled:', hasBank);
  };

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

      {/* Decorative elements - adjust as needed, might be redundant with static cover */}
      {/* <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none"></div> */}
      {/* <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gold-500/10 to-transparent rounded-full blur-3xl -mb-48 -mr-48 pointer-events-none"></div> */}
      
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
          
          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-12"
          >
            <Card className="bg-[var(--portal-card-bg)] border-[var(--portal-border)]">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-gold-500">Filter Properties</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                    className="text-sm text-[var(--portal-text-secondary)] hover:bg-[var(--portal-bg-hover)]"
              >
                Reset Filters
              </Button>
            </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cities" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[var(--portal-bg-hover)] mb-6">
                    <TabsTrigger value="cities" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black transition-all">Cities</TabsTrigger>
                    <TabsTrigger value="progress" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black transition-all">Progress Status</TabsTrigger>
                    <TabsTrigger value="bank_option" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black transition-all">Bank Option</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cities">
                    <h4 className="text-lg font-semibold mb-3 text-[var(--portal-text)]">Select City</h4>
                    <div className="flex flex-wrap gap-3">
                      {availableCities.length > 0 ? (
                        availableCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityFilter(city)}
                            className={`px-5 py-2 rounded-full text-base font-medium transition-all shadow-sm 
                              ${selectedCity === city
                                ? 'bg-gold-500 text-black border border-gold-600'
                                : 'bg-[var(--portal-bg)] text-[var(--portal-text-secondary)] border border-[var(--portal-border)] hover:bg-[var(--portal-bg-hover)] hover:border-gold-500'
                    }`}
                  >
                    {city}
                  </button>
                        ))
                      ) : (
                        <p className="text-[var(--portal-text-secondary)]">No cities available for filtering.</p>
                      )}
              </div>
                  </TabsContent>
                  
                  <TabsContent value="progress">
                    <h4 className="text-lg font-semibold mb-3 text-[var(--portal-text)]">Select Progress Status</h4>
                    <div className="flex flex-wrap gap-3">
                {['excavation', 'on_progress', 'semi_finished', 'fully_finished'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleProgressFilter(status)}
                          className={`px-5 py-2 rounded-full text-base font-medium transition-all shadow-sm 
                            ${selectedProgress === status
                              ? 'bg-gold-500 text-black border border-gold-600'
                              : 'bg-[var(--portal-bg)] text-[var(--portal-text-secondary)] border border-[var(--portal-border)] hover:bg-[var(--portal-bg-hover)] hover:border-gold-500'
                    }`}
                  >
                    {status === 'excavation' ? 'Excavation (ቁፋሮ)' :
                     status === 'on_progress' ? 'On Progress' :
                     status === 'semi_finished' ? 'Semi-finished' :
                     'Fully Finished'}
                  </button>
                ))}
              </div>
                  </TabsContent>
                  
                  <TabsContent value="bank_option">
                    <h4 className="text-lg font-semibold mb-3 text-[var(--portal-text)]">Bank Option Availability</h4>
                    <div className="flex flex-wrap gap-3">
                {[true, false].map((hasBank) => (
                  <button
                    key={String(hasBank)}
                    onClick={() => handleBankOptionFilter(hasBank)}
                          className={`px-5 py-2 rounded-full text-base font-medium transition-all shadow-sm 
                            ${selectedBankOption === hasBank
                              ? 'bg-gold-500 text-black border border-gold-600'
                              : 'bg-[var(--portal-bg)] text-[var(--portal-text-secondary)] border border-[var(--portal-border)] hover:bg-[var(--portal-bg-hover)] hover:border-gold-500'
                    }`}
                  >
                    {hasBank ? 'Bank Option Available' : 'No Bank Option'}
                  </button>
                ))}
              </div>
                  </TabsContent>
                </Tabs>
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
            <div className="flex items-center mb-8">
              <div className="h-10 w-1 bg-gold-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-gold-500">
              {listings.length > 0 
                ? `Properties Listed by ${agent.first_name}`
                : 'No Properties Listed'}
            </h2>
            </div>
            
            <AnimatePresence>
            {listings.length > 0 ? (
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
