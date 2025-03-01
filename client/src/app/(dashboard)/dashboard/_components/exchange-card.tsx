"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoExchangeForm } from "@/app/(dashboard)/dashboard/_components/CryptoExchangeForm";
import { BuySellForm } from "@/app/(dashboard)/dashboard/_components/BuySellForm";

export default function ExchangeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Options</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buySell">
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
