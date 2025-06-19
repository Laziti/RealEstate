import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { createSlug, formatCurrency, formatDate } from '@/lib/formatters';
import ImageGallery from '@/components/public/ImageGallery';
import { Loader2, ArrowLeft, MapPin, Banknote, Calendar, ExternalLink, Phone, MessageCircle, Send, Share2, Copy, Check, FileText, Home, DollarSign, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { createListingSlug } from '@/components/public/ListingCard';
import { Listing, Agent } from '@/types';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ListingDetail = () => {
  const { agentSlug, listingSlug } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching listing details for agentSlug: ${agentSlug}, listingSlug: ${listingSlug}`);

        // Get listings for this agent, including user_id
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select(`*`)
          .neq('status', 'hidden'); // Only fetch active listings

        if (listingsError) {
          console.error('Supabase error fetching listings:', listingsError);
          throw new Error('Error fetching listings');
        }
        if (!listings || listings.length === 0) {
          console.warn('No listings found.', { listings });
          throw new Error('No listings found');
        }
        console.log(`Successfully fetched ${listings.length} total listings.`);
        // console.log('Fetched listings data (all):', listings); // Too verbose to log all listings

        // Find the agent by slug first
        const { data: agentData, error: agentError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, career, phone_number, avatar_url, slug, status')
          .eq('slug', agentSlug)
          .eq('status', 'active')
          .maybeSingle();
        
        if (agentError) {
          console.error('Supabase error fetching agent by slug:', agentError);
          throw new Error('Error fetching agent profile');
        }
        if (!agentData) {
          console.warn(`Agent with slug ${agentSlug} not found or not approved.`);
          throw new Error('Agent not found');
        }
        console.log('Agent found:', agentData);

        // Filter listings by the found agent's ID
        const agentListings = listings.filter(l => l.user_id === agentData.id);
        if (agentListings.length === 0) {
          console.warn(`No listings found for agent ID ${agentData.id}.`);
          throw new Error('No listings found for this agent');
        }
        console.log(`Found ${agentListings.length} listings for agent ${agentData.id}.`);

        // Find the listing with matching slug from the agent's listings
        const matchingListing = agentListings.find(
          listing => {
            const generatedSlug = createListingSlug(listing.title);
            console.log(`Comparing fetched listing title: "${listing.title}" (generated slug: "${generatedSlug}") with URL slug: "${listingSlug}"`);
            return generatedSlug === listingSlug;
          }
        );

        if (!matchingListing) {
          console.warn(`No matching listing found for listingSlug: ${listingSlug} among agent's listings.`);
          throw new Error('Listing not found');
        }

        setListing(matchingListing);
        setAgent(agentData);
        console.log('Setting listing:', matchingListing);
        console.log('Setting agent:', agentData);

        // Handle agent slug verification and redirects (should be handled by initial agent fetch now)
        // if (agentData.slug && agentData.slug !== agentSlug) {
        //   console.warn(`Agent slug mismatch. Redirecting from ${agentSlug} to ${agentData.slug}`);
        //   navigate(`/${agentData.slug}/listing/${createListingSlug(matchingListing.title)}`, { replace: true });
        //   return;
        // }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Caught error in fetchListing:', err);
        setError(errorMessage);
        // Only navigate if an agentSlug exists to avoid infinite redirects on root
        if (agentSlug) {
          console.log(`Navigating back to agent profile due to error: ${errorMessage}`);
          navigate(`/${agentSlug}`, { replace: true });
        } else {
          console.log('Navigating to /not-found due to error and no agentSlug.');
          navigate('/not-found', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    if (agentSlug && listingSlug) {
      fetchListing();
    } else {
      console.warn('Missing agentSlug or listingSlug. Skipping fetchListing.', { agentSlug, listingSlug });
      setLoading(false);
      setError('Invalid URL for listing details.');
      navigate('/not-found', { replace: true });
    }
  }, [agentSlug, listingSlug, navigate]);

  const handleCopyLink = () => {
    const url = window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      
      document.body.removeChild(textarea);
    }
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this listing: ${listing?.title || ''}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this listing: ${listing?.title || ''}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(listing?.title || 'Check out this property');
    const summary = encodeURIComponent(listing?.description || '');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, '_blank', 'noopener,noreferrer');
  };

  const shareToTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this listing: ${listing?.title || ''}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--portal-bg)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-gold-500 mx-auto mb-4" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[var(--portal-text-secondary)] text-lg"
          >
            Loading property details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !listing || !agent) {
    return (
      <div className="min-h-screen bg-[var(--portal-bg)]">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Oops!</h2>
            <p className="text-[var(--portal-text-secondary)] mb-6">
              {error || 'This property listing could not be found.'}
            </p>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const pageTitle = `${listing.title} - Property Listing`;
  const pageDescription = listing.description 
    ? listing.description.substring(0, 160) 
    : `View details for this property listed by ${agent.first_name} ${agent.last_name}`;

  const contactOptions = [
    { 
      type: 'phone',
      label: 'Call Agent',
      icon: <Phone className="h-4 w-4 mr-2" />,
      href: `tel:${agent.phone_number}`,
      link: agent.phone_number,
    },
    { 
      type: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
      href: listing.whatsapp_link,
      link: listing.whatsapp_link,
    },
    { 
      type: 'telegram',
      label: 'Telegram',
      icon: <Send className="h-4 w-4 mr-2" />,
      href: listing.telegram_link,
      link: listing.telegram_link,
    },
  ].filter(option => option.link);

  const shareUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={listing.description?.slice(0, 155) || `View details for ${listing.title}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={listing.description?.slice(0, 155) || `View details for ${listing.title}`} />
        {listing.main_image_url && (
          <meta property="og:image" content={listing.main_image_url} />
        )}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <div className="min-h-screen bg-[var(--portal-bg)]">
        {/* Decorative elements */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full -ml-48 -mt-48 blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full -mr-48 -mb-48 blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-[var(--portal-text-secondary)] hover:text-gold-500 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </motion.button>

          {/* Title and Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--portal-text)] leading-tight">
              {listing.title}
            </h1>
            
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[var(--portal-button-bg)] text-[var(--portal-button-text)] hover:bg-[var(--portal-button-hover)] border-none flex items-center justify-center gap-2 px-6 py-3"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Listing
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 bg-[var(--portal-card-bg)] border-[var(--portal-border)] p-2 rounded-lg shadow-lg">
                  <Button
                    onClick={handleCopyLink}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="text-green-500 mr-2"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="mr-2"
                        >
                          <Copy className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button 
                    onClick={shareToFacebook}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={shareToTwitter}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={shareToWhatsApp}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={shareToLinkedIn}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    onClick={shareToTelegram}
                    variant="ghost"
                    className="w-full justify-start text-[var(--portal-text)] hover:bg-[var(--portal-bg-hover)]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Telegram
                  </Button>
                </PopoverContent>
              </Popover>
            </motion.div>
                </motion.div>
          
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-10 rounded-xl overflow-hidden shadow-xl"
          >
          <ImageGallery 
            mainImage={listing.main_image_url || ''} 
              additionalImages={listing.additional_image_urls || []}
          />
          </motion.div>
          
          {/* Property Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="lg:col-span-2"
            >
              {/* Description Card */}
              <Card className="bg-[var(--portal-card-bg)] border-[var(--portal-border)] rounded-xl shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gold-500 flex items-center">
                    <FileText className="h-6 w-6 mr-3" />
                  Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gold dark:prose-invert max-w-none">
                {listing.description ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-[var(--portal-text-secondary)] text-lg">{listing.description}</p>
                  ) : (
                    <p className="text-[var(--portal-text-secondary)] italic">No description provided for this listing.</p>
                  )}
                </CardContent>
              </Card>

              {/* Key Details - Expanded */}
              <Card className="bg-[var(--portal-card-bg)] border-[var(--portal-border)] rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gold-500 flex items-center">
                    <MapPin className="h-6 w-6 mr-3" />
                    Key Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gold dark:prose-invert max-w-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="font-semibold mb-2 text-gold-500">Location</div>
                  <p className="text-[var(--portal-text-secondary)] bg-[var(--portal-bg-hover)]/50 p-3 rounded-lg">
                      {listing.location || 'Location not specified'}
                    </p>
                  <div className="font-semibold mb-2 text-gold-500">Price</div>
                  <p className="text-[var(--portal-text-secondary)] bg-[var(--portal-bg-hover)]/50 p-3 rounded-lg">
                      {formatCurrency(listing.price || 0)}
                    </p>
                  <div className="font-semibold mb-2 text-gold-500">Listed</div>
                  <p className="text-[var(--portal-text-secondary)] bg-[var(--portal-bg-hover)]/50 p-3 rounded-lg">
                      {formatDate(listing.created_at)}
                    </p>
                </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--portal-card-bg)] border border-[var(--portal-border)] rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4 text-gold-500 flex items-center">
                  <div className="w-1 h-5 bg-gold-500 rounded-full mr-2"></div>
                  Contact Agent
                </h2>

                <div className="mb-4 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--portal-bg-hover)] overflow-hidden border-2 border-gold-500/20">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={`${agent.first_name} ${agent.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-400 to-gold-600 text-black text-3xl font-bold">
                        {agent.first_name?.[0]}{agent.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agent.first_name} {agent.last_name}</h3>
                    {agent.career && (
                      <p className="text-sm text-[var(--portal-text-secondary)]">{agent.career}</p>
                    )}
                  </div>
                </div>

                  <div className="space-y-3">
                  {agent.phone_number && (
                    <a
                      href={`tel:${agent.phone_number}`}
                      className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--portal-button-bg)] text-[var(--portal-button-text)] rounded-lg hover:bg-[var(--portal-button-hover)] transition-colors font-semibold shadow-md"
                    >
                      <Phone className="h-5 w-5" />
                      Call {agent.first_name}
                    </a>
                  )}
                  {agent.whatsapp_link && (
                    <a
                      href={agent.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--portal-button-bg)] text-[var(--portal-button-text)] rounded-lg hover:bg-[var(--portal-button-hover)] transition-colors font-semibold shadow-md"
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </a>
                  )}
                  {agent.telegram_link && (
                    <a
                      href={agent.telegram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--portal-button-bg)] text-[var(--portal-button-text)] rounded-lg hover:bg-[var(--portal-button-hover)] transition-colors font-semibold shadow-md"
                    >
                      <Send className="h-5 w-5" />
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingDetail;