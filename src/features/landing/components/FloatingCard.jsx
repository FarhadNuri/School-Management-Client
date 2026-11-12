import { motion } from 'framer-motion';
import {
  BookOpenText,
  CheckCircle,
  Megaphone,
  Receipt,
} from '@phosphor-icons/react';

const ICON_MAP = {
  attendance: CheckCircle,
  homework: BookOpenText,
  fees: Receipt,
  announcement: Megaphone,
};

const cardVariant = {
  hidden: (custom) =>
    custom?.reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 18, scale: (custom?.scale ?? 1) * 0.88 },
  visible: (custom) =>
    custom?.reduceMotion
      ? { opacity: 1, transition: { duration: 0.2 } }
      : {
          opacity: 1,
          y: 0,
          scale: custom?.scale ?? 1,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 16,
          },
        },
};

export default function FloatingCard({ card, shouldReduceMotion }) {
  const IconComponent = ICON_MAP[card.icon] || CheckCircle;

  return (
    <motion.div
      className={`lp-floating-card-anchor is-${card.position}${
        card.mobileVisible ? '' : ' is-desktop-only'
      }`}
      style={{ zIndex: card.zIndex }}
      variants={cardVariant}
      custom={{ scale: card.scale, reduceMotion: shouldReduceMotion }}
    >
      <div className={`lp-floating-card is-tone-${card.tone}`}>
        <span className={`lp-floating-card-icon is-tone-${card.tone}`} aria-hidden="true">
          <IconComponent size={16} weight="bold" />
        </span>
        <div className="lp-floating-card-body">
          <span className="lp-floating-card-label caption-5">{card.label}</span>
          <span className="lp-floating-card-text caption-3">{card.text}</span>
        </div>
      </div>
    </motion.div>
  );
}

