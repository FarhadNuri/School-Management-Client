import Icon from '../../../components/ui/Icon';

export default function InfoCard({
  title,
  subtitle,
  course = "BSc. Computer Science",
  tag,
  description,
  footerMeta,
  actionText = "View",
  onAction,
  letter = "A"
}) {
  return (
    <div className="cd">
      <div className="row">
        <span className="tl">{letter}</span>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="row">
        <span className="tg">
          <Icon name="cap" />
          {course}
        </span>
        {tag}
      </div>
      <p>{description}</p>
      <div className="row">
        <span style={{ color: 'var(--g-mute)', fontSize: '12px' }}>
          {footerMeta}
        </span>
        <button
          type="button"
          className="ghost"
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}
