import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function StatCard({ title, value, icon, description, variant = 'primary' }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h3 className="fw-bold mb-1">{value}</h3>
            <small className="text-muted">{description}</small>
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
