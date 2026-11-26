type TypedTextProps = {
  text: string
  group: string
  className?: string
}

export function TypedText({ text, group, className = '' }: TypedTextProps) {
  const tokens = text.split(/(\s+)/)

  return (
    <span aria-hidden="true" className={className}>
      {tokens.map((token, tokenIndex) => {
        if (!token) return null
        if (/^\s+$/.test(token)) {
          return (
            <span key={`space-${tokenIndex}`} data-typed-char="" data-typed-group={group}>
              {token}
            </span>
          )
        }

        return (
          <span key={`word-${tokenIndex}`} className="whitespace-nowrap">
            {Array.from(token).map((char, charIndex) => (
              <span
                key={`char-${tokenIndex}-${charIndex}`}
                data-typed-char=""
                data-typed-group={group}
              >
                {char}
              </span>
            ))}
          </span>
        )
      })}
    </span>
  )
}
