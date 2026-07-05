export default function Logo({ className = '' }) {
  return (
    <svg 
      className={className} 
      width="30" 
      height="30" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 20l4-16" />
      <path d="M18 16l4-4-4-4" />
      <path d="M6 8l-4 4 4 4" />
    </svg>
  );
}
