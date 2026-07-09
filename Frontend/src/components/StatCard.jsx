import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../context/ThemeContext.jsx';

function StatCard({ title, value, icon, description, variant = 'primary' }) {
  const { colors, isDark } = useTheme();

  return (
    <Card 
      className="border-0 shadow-sm h-100"
      style={{
        backgroundColor: colors.bgCard,
        color: colors.textPrimary,
        border: isDark ? `1px solid ${colors.borderCard}` : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <p style={{ color: colors.textSecondary }} className="mb-1">{title}</p>
            <h3 className="fw-bold mb-1" style={{ color: colors.textPrimary }}>{value}</h3>
            <small style={{ color: colors.textMuted }}>{description}</small>
          </div>
          <span className={`stat-icon bg-${variant}-subtle text-${variant} rounded-3 d-inline-flex align-items-center justify-content-center`}>
            <FontAwesomeIcon icon={icon} />
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default StatCard;
