import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Briefcase, Award, Star, Calendar, MessageCircle, Send } from 'lucide-react';

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
}

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
  telegramLink
}: AgentProfileHeaderProps) => {
  // Default description if none provided
  const agentDescription = description || `${firstName} ${lastName} is a trusted real estate agent specializing in finding the perfect properties for clients.`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-card-bg)] p-8 shadow-xl backdrop-blur-sm"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/3 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/3 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative flex-shrink-0"
        >
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[var(--portal-border)] shadow-lg bg-[var(--portal-bg-hover)]">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={`${firstName} ${lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--portal-bg)] to-[var(--portal-card-bg)] text-gold-500 text-4xl font-bold">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Info Section */}
        <div className="flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--portal-text)] mb-2">{firstName} {lastName}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4 text-[var(--portal-text-secondary)]">
              {career && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--portal-bg-hover)] rounded-full text-sm font-medium">
                  <Briefcase className="h-4 w-4 text-gold-500" />
                  <span>{career}</span>
                </div>
              )}
              
              {experience && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--portal-bg-hover)] rounded-full text-sm font-medium">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  <span>{experience}</span>
                </div>
              )}
              
              {location && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--portal-bg-hover)] rounded-full text-sm font-medium">
                  <MapPin className="h-4 w-4 text-gold-500" />
                  <span>{location}</span>
                </div>
              )}
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-[var(--portal-text-secondary)] mb-6 max-w-3xl leading-relaxed text-lg"
            >
              {agentDescription}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex flex-wrap gap-4 mt-6"
            >
              {phoneNumber && (
                <a 
                  href={`tel:${phoneNumber}`} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-semibold shadow-md"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              
              {email && (
                <a 
                  href={`mailto:${email}`} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--portal-bg-hover)] text-[var(--portal-text)] rounded-lg hover:bg-[var(--portal-border)] transition-colors font-semibold"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}

              {whatsappLink && (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}

              {telegramLink && (
                <a 
                  href={telegramLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentProfileHeader;
