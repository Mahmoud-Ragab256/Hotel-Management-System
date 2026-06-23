import { Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

const feedbackMeta = (type = 'info') => {
  if (type === 'success') return { title: 'Success', icon: faCircleCheck, tone: 'success' };
  if (type === 'danger') return { title: 'Error', icon: faCircleExclamation, tone: 'danger' };
  if (type === 'warning') return { title: 'Attention', icon: faTriangleExclamation, tone: 'warning' };
  return { title: 'Info', icon: faCircleInfo, tone: 'info' };
};

function FeedbackCard({ feedback, onClose }) {
  if (!feedback?.message) return null;

  const meta = feedbackMeta(feedback.type);

  return (
    <Card className={`border-0 shadow-sm feedback-card feedback-card-${meta.tone}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-start gap-3">
          <span className={`feedback-icon bg-${meta.tone}-subtle text-${meta.tone} rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0`}>
            <FontAwesomeIcon icon={meta.icon} />
          </span>
          <div className="flex-grow-1">
            <div className="fw-semibold">{meta.title}</div>
            <div className="small text-muted">{feedback.message}</div>
          </div>
          {onClose && (
            <Button variant="light" size="sm" className="rounded-circle lh-1" onClick={onClose} aria-label="Close message">
              ×
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default FeedbackCard;
