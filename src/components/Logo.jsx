export default function Logo({ className = '' }) {
  return (
    <svg 
      className={className} 
      width="32" 
      height="32" 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(50 50)">
        <path d="M-5,-10 C 15,-40 45,-30 30,-10 C 20,5 5,-5 -5,-10 Z" />
        <path d="M-5,-10 C 15,-40 45,-30 30,-10 C 20,5 5,-5 -5,-10 Z" transform="rotate(72)" />
        <path d="M-5,-10 C 15,-40 45,-30 30,-10 C 20,5 5,-5 -5,-10 Z" transform="rotate(144)" />
        <path d="M-5,-10 C 15,-40 45,-30 30,-10 C 20,5 5,-5 -5,-10 Z" transform="rotate(216)" />
        <path d="M-5,-10 C 15,-40 45,-30 30,-10 C 20,5 5,-5 -5,-10 Z" transform="rotate(288)" />
      </g>
    </svg>
  );
}
