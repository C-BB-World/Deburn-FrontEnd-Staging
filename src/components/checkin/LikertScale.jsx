/**
 * LikertScale
 * Reusable 5-point scale picker (e.g. Never...Almost always, Strongly disagree...Strongly agree).
 * Controlled component: value is 1-5 or null, onChange receives the new 1-5 value.
 */

export function LikertScale({ question, value, onChange, labels, helperText }) {
  return (
    <div className="likert-question">
      <h4 className="likert-label">{question}</h4>
      {helperText && <p className="likert-helper">{helperText}</p>}
      <div className="likert-scale" role="radiogroup" aria-label={question}>
        {labels.map((label, idx) => {
          const optionValue = idx + 1;
          const selected = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`likert-option ${selected ? 'selected' : ''}`}
              onClick={() => onChange(optionValue)}
            >
              <span className="likert-option-dot" />
              <span className="likert-option-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
