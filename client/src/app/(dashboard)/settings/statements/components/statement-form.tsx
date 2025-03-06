"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download } from "lucide-react"

// Define types
type Period = "7" | "30" | "90" | "180" | "365"

interface Download {
  id: number
  period: string
  date: string
  size: string
}

type DownloadsList = {
  [K in Period]: Download[]
}

// Sample data with proper typing
const downloadsList: DownloadsList = {
  "7": [
    {
      id: 1,
      period: "Last 7 days",
      date: "2024-03-13",
      size: "84 KB",
    },
  ],
  "30": [
    {
      id: 2,
      period: "Last 30 days",
      date: "2024-03-10",
      size: "156 KB",
    },
    {
      id: 3,
      period: "Last 30 days",
      date: "2024-02-28",
      size: "142 KB",
    },
  ],
  "90": [
    {
      id: 4,
      period: "Last 90 days",
      date: "2024-02-15",
      size: "284 KB",
    },
  ],
  "180": [
    {
      id: 5,
      period: "Last 180 days",
      date: "2024-01-01",
      size: "512 KB",
    },
  ],
  "365": [
    {
      id: 6,
      period: "Last 365 days",
      date: "2023-12-01",
      size: "1.2 MB",
    },
  ],
}

export function StatementForm() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30")

  const handleDownload = (downloadId: number) => {
    // Handle download logic here
    console.log(`Downloading statement ${downloadId}`)
    
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h4 className="text-base font-medium mb-4">
            Generate consolidated statement (PDF) via email
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select 
                defaultValue={selectedPeriod} 
                onValueChange={(value: Period) => setSelectedPeriod(value)}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 180 days</SelectItem>
                  <SelectItem value="365">Last 365 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                A statement can be generated only if there is any account activity within the period selected.
              </p>
            </div>
            <Button className="w-[300px] bg-blue-600 hover:bg-blue-700">
              Generate Report
            </Button>
          </div>
        </div>

        <div className="pt-6">
          <h4 className="text-base font-medium mb-4">Downloads</h4>
          <div className="space-y-2">
            {downloadsList[selectedPeriod]?.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">Statement - {download.period}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Generated on {typeof window === 'undefined' ? download.date : new Date(download.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{download.size}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => handleDownload(download.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {downloadsList[selectedPeriod]?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No statements available for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 