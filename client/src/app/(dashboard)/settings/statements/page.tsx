import { Separator } from "../../../../components/ui/separator";
import { DateRangePicker } from "./components/date-range-picker";
import { StatementsDataTable } from "./components/data-table";
import { StatementForm } from "./components/statement-form";
import { PageLayout } from "../../../../components/PageLayout";

export default function StatementsPage() {
  return (
    <PageLayout
      heading="Statements"
      subheading="View and download your transaction statements"
    >
      <div className="space-y-12">
        <div className="space-y-6">
          <div className="flex justify-end">
            <DateRangePicker />
          </div>
          <StatementsDataTable />
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Generate Statement</h3>
            <p className="text-sm text-muted-foreground">
              Generate and download your account statements
            </p>
          </div>
          <StatementForm />
        </div>
      </div>
    </PageLayout>
  );
}
