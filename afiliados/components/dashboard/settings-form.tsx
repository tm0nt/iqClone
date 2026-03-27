"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {  SettingsAPI } from "./settings-api"

export function SettingsForm() {
  return (
    <div className="grid w-full grid-cols-1 mb-8">        
    <SettingsAPI />
</div>
  )
}
