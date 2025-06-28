import type { PlatformUser, Team } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShieldHalf, MoreVertical, Edit, Trash2 } from "lucide-react";

interface TeamCardProps {
  team: Team;
  users: PlatformUser[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  isAdmin: boolean;
}

export function TeamCard({ team, users, onEdit, onDelete, isAdmin }: TeamCardProps) {
  const getTeamColorClasses = (teamName: Team['name']) => {
    switch (teamName) {
      case 'Red Team':
        return {
          icon: 'text-red-500',
          progress: 'bg-red-500',
          border: 'border-red-500/20',
        };
      case 'Blue Team':
        return {
          icon: 'text-primary',
          progress: 'bg-primary',
          border: 'border-primary/20',
        };
      case 'Purple Team':
        return {
          icon: 'text-purple-500',
          progress: 'bg-purple-500',
          border: 'border-purple-500/20',
        };
    }
  };
  
  const teamColor = getTeamColorClasses(team.name);

  return (
    <Card className={`bg-card/60 backdrop-blur-xl ${teamColor.border} hover:border-accent/50 transition-colors flex flex-col`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ShieldHalf className={`w-8 h-8 ${teamColor.icon}`} />
            <div>
              <CardTitle className="font-headline text-2xl">{team.name}</CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </div>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(team)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Team Members</h4>
        <div className="flex flex-wrap gap-2">
            {team.members && team.members.map(member => {
                const user = users.find(u => u.id === member.userId);
                if (!user) return null;

                return (
                    <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.email} data-ai-hint="person portrait" />
                            <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs font-semibold">{user.email.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                    </div>
                );
            })}
            {(!team.members || team.members.length === 0) && <p className="text-xs text-muted-foreground">No members assigned.</p>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="w-full flex justify-between items-center">
            <h4 className="font-semibold text-sm text-muted-foreground">Capacity</h4>
            <span className="text-sm font-bold">{team.capacity}%</span>
        </div>
        <Progress value={team.capacity} className="w-full" indicatorClassName={teamColor.progress} />
      </CardFooter>
    </Card>
  )
}
