import { Suspense } from "react";
import { QuotesCard } from "./QuotesCard";
import { Skeleton } from "@/components/ui/skeleton";

export function QuotesWrapper() {
    return (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <QuotesCard />
        </Suspense>
    );
} 