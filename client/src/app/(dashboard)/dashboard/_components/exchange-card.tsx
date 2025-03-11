"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoExchangeForm } from "@/app/(dashboard)/dashboard/_components/CryptoExchangeForm";
import { BuySellForm } from "@/app/(dashboard)/dashboard/_components/BuySellForm";
import { ClientOnly } from "@/components/ClientOnly";
import { Skeleton } from "@/components/ui/skeleton";

// Separate content component to handle client-side rendering
function ExchangeCardContent() {
  const [activeTab, setActiveTab] = useState("buySell");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Options</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buySell" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buySell">Buy/Sell</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
          </TabsList>
          <TabsContent value="buySell" asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <BuySellForm />
            </motion.div>
          </TabsContent>
          <TabsContent value="swap" asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <CryptoExchangeForm />
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Main component with ClientOnly wrapper
export default function ExchangeCard() {
  return (
    <ClientOnly fallback={
      <Card>
        <CardHeader>
          <CardTitle>Trade Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    }>
      <ExchangeCardContent />
    </ClientOnly>
  );
}
