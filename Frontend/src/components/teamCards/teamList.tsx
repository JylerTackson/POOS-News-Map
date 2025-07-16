import type { TeamMember } from "./teamCard";
import { TeamCards } from "./teamCard";

export interface TeamListProps {
  TeamMembers: TeamMember[];
}

export default function TeamList({ TeamMembers }: TeamListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {TeamMembers.map((item, i) => (
        <TeamCards key={i} member={item} />
      ))}
    </div>
  );
}
