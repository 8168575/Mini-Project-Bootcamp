import PropTypes from 'prop-types';

function SectionCard({ eyebrow, title, description, className = '', children }) {
  return (
    <section
      className={`rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(102,84,60,0.10)] backdrop-blur ${className}`}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#5f7669]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

SectionCard.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default SectionCard;
