import { initials, avatarTint } from "@/lib/avatar";

export default function CompanyAvatar({ name, size = "md" }) {
  return (
    <span
      className={`company-avatar company-avatar-${size}`}
      data-tint={avatarTint(name)}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
