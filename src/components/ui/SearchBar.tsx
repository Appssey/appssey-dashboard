import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search',
  className,
  onSearch,
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch?.(newQuery);
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-full bg-background-light border border-border focus-within:border-border-light transition-colors',
      className
    )}>
      <Search size={18} className="text-primary-muted" />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-primary placeholder:text-primary-muted w-full"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;