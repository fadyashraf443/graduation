import { ReportGenerator } from "@/components/reports/report-generator";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">Predictive Analytics & Reports</h1>
          <p className="text-muted-foreground">Generate custom reports with predictive insights using AI.</p>
      </div>
      <ReportGenerator />
    </div>
  );
}
