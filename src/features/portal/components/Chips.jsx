import { useState } from 'react';

export default function Chips({
  items = [],
  defaultIndex = 0,
  onChange,
  style
}) {
  const [activeIdx, setActiveIdx] = useState(defaultIndex);

  const handleClick = (idx, item) => {
    setActiveIdx(idx);
    if (onChange) onChange(item, idx);
  };

  return (
    <div className="chips" style={style}>
      {items.map((item, idx) => (
        <span
          key={item}
          className={`ch ${activeIdx === idx ? 'on' : ''}`.trim()}
          onClick={() => handleClick(idx, item)}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
