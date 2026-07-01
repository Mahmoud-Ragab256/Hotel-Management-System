import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCalendarCheck,
  faCircleCheck,
  faRightToBracket,
  faTableColumns,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import '../styles/clientPages.css';

const defaultSteps = [
  {
    key: 'browse',
    title: 'Choose room',
    description: 'Guest browses rooms and opens room details.',
    icon: faBed
  },
  {
    key: 'auth',
    title: 'Login / Register',
    description: 'Guest signs in only when ready to book.',
    icon: faUserPlus
  },
  {
    key: 'booking',
    title: 'Confirm booking',
    description: 'Dates are selected and booking is created.',
    icon: faCalendarCheck
  },
  {
    key: 'dashboard',
    title: 'Admin receives it',
    description: 'Booking appears in dashboard bookings and invoices.',
    icon: faTableColumns
  }
];

function ClientBookingSteps({ activeStep = 1, compact = false }) {
  return (
    <div className={`client-booking-steps ${compact ? 'client-booking-steps-compact' : ''}`}>
      {defaultSteps.map((step, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;

        return (
          <div className={`client-booking-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`} key={step.key}>
            <div className="client-booking-step-icon">
              <FontAwesomeIcon icon={isDone ? faCircleCheck : step.icon} />
            </div>
            <div className="client-booking-step-body">
              <span>Step {stepNumber}</span>
              <strong>{step.title}</strong>
              {!compact && <p>{step.description}</p>}
            </div>
            {step.key === 'auth' && activeStep === 2 && (
              <FontAwesomeIcon icon={faRightToBracket} className="client-step-hint" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ClientBookingSteps;
