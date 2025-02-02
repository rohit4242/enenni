import { Separator } from "@/components/ui/separator"
import { TermsContent } from "./components/terms-content"

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Terms & Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Please read our terms and conditions carefully
        </p>
      </div>
      <Separator />
      <TermsContent />
    </div>
  )
} 