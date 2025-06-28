import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ThreatChart } from "@/components/dashboard/threat-chart";
import { TeamPerformance } from "@/components/dashboard/team-performance";
import { Activity, AlertTriangle, ShieldCheck, Target } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const recentTasks = [
        { id: 'task-3', title: 'Review Firewall Ruleset', team: 'Blue', priority: 'High' },
        { id: 'task-1', title: 'Network Vulnerability Scan', team: 'Red', priority: 'High' },
        { id: 'task-7', title: 'Conduct ATT&CK Emulation', team: 'Purple', priority: 'High' },
        { id: 'task-4', title: 'Update SIEM Detection Logic', team: 'Blue', priority: 'High' },
    ];
    
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Threats" value="12" icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} description="Critical alerts needing attention" />
        <StatsCard title="Team Efficiency" value="92%" icon={<Activity className="h-4 w-4 text-muted-foreground" />} description="+5% from last week" />
        <StatsCard title="Systems Hardened" value="452" icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} description="Total secure configurations" />
        <StatsCard title="Attack Vectors" value="3" icon={<Target className="h-4 w-4 text-muted-foreground" />} description="New potential vulnerabilities" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-headline">Threat Analysis Overview</CardTitle>
            <CardDescription>Real-time threat intelligence data from the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ThreatChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-headline">Team Performance</CardTitle>
            <CardDescription>Tasks completed by each team this cycle.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamPerformance />
          </CardContent>
        </Card>
      </div>
      <Card className="bg-card/60 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="font-headline">High-Priority Tasks</CardTitle>
            <CardDescription>Critical and high-priority tasks requiring immediate action.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Assigned Team</TableHead>
                        <TableHead>Priority</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentTasks.map(task => (
                        <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                                <Badge variant={task.team === 'Red' ? 'destructive' : task.team === 'Blue' ? 'default' : 'secondary'} 
                                className={cn({'bg-purple-500 text-white': task.team === 'Purple', 'bg-primary': task.team === 'Blue', 'bg-red-600': task.team === 'Red' })}>
                                    {task.team} Team
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-red-500 text-red-500">{task.priority}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
