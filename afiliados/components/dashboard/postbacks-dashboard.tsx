"use client"

import { useState } from "react"
import { Download, Filter, Plus, Search, MessageSquare, Code, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { PostbacksTable } from "@/components/dashboard/postbacks-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"  

export function PostbacksDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false) // Controle de exibição do modal

  const handleCopy = () => {
    navigator.clipboard.writeText(
      "https://api.bincebroker.com/postback?aff_id={aff_id}&offer_id={offer_id}&transaction_id={transaction_id}",
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangePicker />
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar postback..."
              className="w-full pl-8 sm:w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Postback
          </Button>
        </div>
      </div>

      {/* Cards com informações */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Postbacks */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Postbacks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Configurados atualmente</p>
          </CardContent>
        </Card>

        {/* Postbacks Ativos */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Postbacks Ativos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">0% do total</p>
          </CardContent>
        </Card>

        {/* Conversões Rastreadas */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversões Rastreadas</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 16v-3a2 2 0 0 0-2-2h-4V8" />
              <path d="M8 8v3a2 2 0 0 0 2 2h4v3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>

        {/* Taxa de Sucesso */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">0% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e Conteúdos */}
      <Tabs defaultValue="postbacks" className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 tab-highlight-animation">
          <TabsTrigger value="postbacks" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Postbacks
          </TabsTrigger>
          <TabsTrigger value="setup" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Configuração
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="postbacks" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lista de Postbacks</CardTitle>
                <CardDescription>Gerencie seus postbacks configurados</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <PostbacksTable searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Configuração de Postback</CardTitle>
              <CardDescription>Configure novos postbacks para rastreamento de conversões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">URL Global de Postback</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use esta URL para configurar postbacks em plataformas de terceiros
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      value="https://api.bincebroker.com/postback?aff_id={aff_id}&offer_id={offer_id}&transaction_id={transaction_id}"
                      readOnly
                      className="bg-muted/50 font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Criar Novo Postback</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Postback</Label>
                      <Input id="name" placeholder="Ex: Google Ads Conversions" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform">Plataforma</Label>
                      <Select>
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Selecione a plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="facebook">Facebook Ads</SelectItem>
                          <SelectItem value="tiktok">TikTok Ads</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="url">URL do Postback</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/postback?transaction_id={transaction_id}"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{aff_id}"}, {"{offer_id}"}, {"{transaction_id}"} como parâmetros dinâmicos
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea id="notes" placeholder="Adicione notas ou informações adicionais" />
                    </div>
                  </div>
                  <Button className="mt-4">Criar Postback</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 animate-fade-in">
          {/* Logs de Postback */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Logs de Postback</CardTitle>
              <CardDescription>Visualize os logs de execução dos seus postbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="border-b bg-muted/50 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Logs Recentes</h3>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Logs
                    </Button>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-auto p-4">
                  <div className="space-y-4">
                    {/* Simulação de logs */}
                 {/*   <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="font-medium">Sucesso</span>
                        </div>
                        <span className="text-sm text-muted-foreground">26/04/2023 14:32:45</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-mono text-xs">POST</span> https://api.example.com/postback
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Parâmetros: aff_id=123, offer_id=456, transaction_id=789
                        </p>
                        <p className="mt-1 text-xs text-green-600">Resposta: 200 OK</p>
                      </div>
                    </div>*/}
                  </div> 
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para Criar Novo Postback */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Criar Novo Postback</h2>
          {/* Coloque o conteúdo do formulário aqui */}
          <div>
            <Label htmlFor="name">Nome do Postback</Label>
            <Input id="name" placeholder="Ex: Google Ads Conversions" />
          </div>
          <div className="mt-4">
            <Button onClick={handleCloseModal}>Fechar</Button>
            <Button variant="outline" className="ml-2">
              Criar Postback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
