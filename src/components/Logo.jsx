export default function Logo({ size = 36 }) {
  return (
    <svg width={size * 3.5} height={size} viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="2" width="36" height="36" rx="10" fill="#1B2A5E"/>
      <path d="M18 8 C14 8 11 11 11 15 C11 17.5 12.2 19.7 14 21 L10 30 C9.5 31 10 32 11 32.5 C12 33 13 32.5 13.5 31.5 L17.5 22.5 C17.7 22.5 17.8 22.5 18 22.5 C22 22.5 25 19.5 25 15.5 C25 14 24.6 12.6 23.8 11.5 L21 14.3 L19.5 12.8 L22.3 10 C21.2 8.8 19.7 8 18 8Z" fill="#C07C2E"/>
      <polygon points="20,9 17,16 20,16 17,23 23,14 20,14" fill="white" opacity="0.9"/>
      <text x="42" y="17" fontFamily="Georgia, serif" fontWeight="900" fontSize="13" fill="#1B2A5E" letterSpacing="0.5">Skill</text>
      <text x="42" y="32" fontFamily="Georgia, serif" fontWeight="900" fontSize="13" fill="#C07C2E" letterSpacing="0.5">Link</text>
      <circle cx="75" cy="24" r="2" fill="#1B2A5E"/>
    </svg>
  )
}
