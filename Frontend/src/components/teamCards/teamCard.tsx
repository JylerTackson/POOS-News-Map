import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface TeamMember {
  fullName: String;
  role: String;
  degree: String;
  gradYear: number;
  description: String;
  email: String;
  headshot: {
    data: Buffer; // the raw binary data
    contentType: String; // e.g. "image/jpeg" or "image/png"
  };
}

interface TeamMemberProps {
  member: TeamMember;
}

export function TeamCards({ member }: TeamMemberProps) {
  const { fullName, role, degree, gradYear, description, email } =
    member;

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl p-4 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>{fullName}</CardTitle>
        <CardDescription>
          {degree} • {gradYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{role}</span>
      </CardFooter>
    </Card>
  );
}
