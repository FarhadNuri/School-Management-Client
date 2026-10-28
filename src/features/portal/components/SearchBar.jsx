import Icon from '../../../components/ui/Icon';

export default function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  prefix,
  suffix,
  actionButton,
  showSearchButton = true
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form className="bar" onSubmit={handleSubmit}>
      {prefix}
      <div className="in">
        <Icon name="search" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>
      {showSearchButton && (
        <button type="submit" className="pb">
          <Icon name="search" />
          Search
        </button>
      )}
      {suffix}
      {actionButton}
    </form>
  );
}
