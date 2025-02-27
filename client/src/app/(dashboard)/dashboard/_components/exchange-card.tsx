"use client";

import React from "react";
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
            <TabsTrigger value="cryptoExchange">Crypto Exchange</TabsTrigger>
          </TabsList>
          <TabsContent value="buySell">
            <BuySellForm />
          </TabsContent>
          <TabsContent value="cryptoExchange">
            <CryptoExchangeForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
