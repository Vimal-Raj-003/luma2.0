// Splits text into words, each inside an overflow-hidden mask so the inner
// span can be translated up for a masked reveal (.mask__in).
export default function MaskText({ as: Tag = 'span', text, className = '', chars = false }) {
  const parts = chars ? text.split('') : text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} aria-hidden="true">
          <span className="mask">
            <span className="mask__in">{p}</span>
          </span>
          {!chars && i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
