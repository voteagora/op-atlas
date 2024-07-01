export function StarIcon({
  className,
  size = 16,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_483_12433)">
        <path
          d="M0.666992 7.33366C4.34889 7.33366 7.33366 4.34889 7.33366 0.666992H8.66699C8.66699 4.34889 11.6518 7.33366 15.3337 7.33366V8.66699C11.6518 8.66699 8.66699 11.6518 8.66699 15.3337H7.33366C7.33366 11.6518 4.34889 8.66699 0.666992 8.66699V7.33366Z"
          fill="#404454"
        />
      </g>
      <defs>
        <clipPath id="clip0_483_12433">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
