import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  progressStatus?: string;
  bankOption?: boolean;
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableCities: string[];
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  onSearch, 
  availableCities, 
  placeholder = "Search properties...",
  className = ""
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, onSearch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({});
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof SearchFilters] !== undefined
  ).length;

  const hasActiveSearch = searchQuery.trim() !== '' || activeFiltersCount > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--portal-text-secondary)]" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20 h-12 text-base bg-[var(--portal-card-bg)] border-[var(--portal-border)] focus:border-gold-500 focus:ring-gold-500/20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 relative"
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gold-500 text-black"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[var(--portal-card-bg)] border-[var(--portal-border)]" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-gold-500">Filter Properties</h4>
                
                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--portal-text)]">Price Range (ETB)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="bg-[var(--portal-bg)] border-[var(--portal-border)]"
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="bg-[var(--portal-bg)] border-[var(--portal-border)]"
                    />
                  </div>
                </div>

                {/* City Filter */}
                {availableCities.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--portal-text)]">City</label>
                    <select
                      value={filters.city || ''}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="w-full p-2 rounded-md bg-[var(--portal-bg)] border border-[var(--portal-border)] text-[var(--portal-text)]"
                    >
                      <option value="">All Cities</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Progress Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--portal-text)]">Progress Status</label>
                  <select
                    value={filters.progressStatus || ''}
                    onChange={(e) => handleFilterChange('progressStatus', e.target.value)}
                    className="w-full p-2 rounded-md bg-[var(--portal-bg)] border border-[var(--portal-border)] text-[var(--portal-text)]"
                  >
                    <option value="">All Status</option>
                    <option value="excavation">Excavation (ቁፋሮ)</option>
                    <option value="on_progress">On Progress</option>
                    <option value="semi_finished">Semi-finished</option>
                    <option value="fully_finished">Fully Finished</option>
                  </select>
                </div>

                {/* Bank Option */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--portal-text)]">Bank Option</label>
                  <select
                    value={filters.bankOption === undefined ? '' : filters.bankOption.toString()}
                    onChange={(e) => handleFilterChange('bankOption', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full p-2 rounded-md bg-[var(--portal-bg)] border border-[var(--portal-border)] text-[var(--portal-text)]"
                  >
                    <option value="">All Options</option>
                    <option value="true">Bank Option Available</option>
                    <option value="false">No Bank Option</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.minPrice && (
              <Badge variant="secondary" className="bg-gold-500/10 text-gold-500 border border-gold-500/20">
                Min: {filters.minPrice.toLocaleString()} ETB
                <button
                  onClick={() => removeFilter('minPrice')}
                  className="ml-1 hover:text-gold-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.maxPrice && (
              <Badge variant="secondary" className="bg-gold-500/10 text-gold-500 border border-gold-500/20">
                Max: {filters.maxPrice.toLocaleString()} ETB
                <button
                  onClick={() => removeFilter('maxPrice')}
                  className="ml-1 hover:text-gold-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="bg-gold-500/10 text-gold-500 border border-gold-500/20">
                City: {filters.city}
                <button
                  onClick={() => removeFilter('city')}
                  className="ml-1 hover:text-gold-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.progressStatus && (
              <Badge variant="secondary" className="bg-gold-500/10 text-gold-500 border border-gold-500/20">
                Status: {filters.progressStatus === 'excavation' ? 'Excavation (ቁፋሮ)' :
                         filters.progressStatus === 'on_progress' ? 'On Progress' :
                         filters.progressStatus === 'semi_finished' ? 'Semi-finished' :
                         'Fully Finished'}
                <button
                  onClick={() => removeFilter('progressStatus')}
                  className="ml-1 hover:text-gold-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.bankOption !== undefined && (
              <Badge variant="secondary" className="bg-gold-500/10 text-gold-500 border border-gold-500/20">
                {filters.bankOption ? 'Bank Option Available' : 'No Bank Option'}
                <button
                  onClick={() => removeFilter('bankOption')}
                  className="ml-1 hover:text-gold-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;