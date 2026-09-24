import useReveal from "../hooks/useReveal";

/**
 * Generic scroll-reveal wrapper. Renders `as` (default div), applies the
 * shared `.reveal` fade/blur-up transition, and supports a stagger index
 * for sibling groups (30–80ms per item, per landing-page-design B7/B11).
 */
export default function Reveal({
  as: Tag = "div",
  index = 0,
  className = "",
  children,
  ...rest
}) {
  const ref = useReveal();
  const delay = Math.min(index, 8) * 60;

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
