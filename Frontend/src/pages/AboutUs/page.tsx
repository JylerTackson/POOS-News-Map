import React, { Suspense, useEffect, useState } from "react";

import type { TeamMember } from "@/components/teamCards/teamCard";

//Lazy-Load the TeamList component
const TeamList = React.lazy(
  () => import("../../components/teamCards/teamList")
);

export default function AboutPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/team/About")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: TeamMember[]) => setMembers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Today's News</h1>
      {/* Suspense shows a fallback while NewsList is loading */}
      <Suspense fallback={<p>Loading Members…</p>}>
        <TeamList TeamMembers={members} />
      </Suspense>
    </div>
  );
}
