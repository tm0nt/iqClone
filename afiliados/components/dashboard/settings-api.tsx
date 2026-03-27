"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active?: boolean;
}

export function SettingsAPI() {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const events = ["Conversões", "Pagamentos", "Usuários", "Campanhas"];

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await fetch("/api/webhooks/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Falha ao buscar webhooks");
      
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar webhooks. Tente novamente.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleEventChange = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

const handleRegisterWebhook = useCallback(async () => {
  if (!webhookUrl || !isValidUrl(webhookUrl) || selectedEvents.length === 0) {
    toast({
      title: "Erro",
      description: "Por favor, insira uma URL válida e selecione pelo menos um evento.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch("/api/webhooks/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ 
        url: webhookUrl, 
        eventType: selectedEvents.join(",") 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Falha ao registrar webhook");
    }

    const newWebhook = await response.json();
    
    // Tratamento seguro para os eventos
    let normalizedEvents: string[] = [];
    if (Array.isArray(newWebhook.events)) {
      normalizedEvents = newWebhook.events;
    } else if (typeof newWebhook.eventType === 'string') {
      normalizedEvents = newWebhook.eventType.split(",");
    } else if (Array.isArray(newWebhook.eventType)) {
      normalizedEvents = newWebhook.eventType;
    }

    setWebhooks((prev) => [...prev, {
      id: newWebhook.id,
      url: newWebhook.url,
      events: normalizedEvents,
      active: newWebhook.active
    }]);
    
    setWebhookUrl("");
    setSelectedEvents([]);
    
    toast({
      title: "Webhook registrado",
      description: "O webhook foi registrado com sucesso.",
    });
  } catch (error: any) {
    toast({
      title: "Erro",
      description: error.message || "Falha ao registrar o webhook. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
}, [webhookUrl, selectedEvents]);

  const handleDeleteWebhook = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/webhooks/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao remover webhook");
      }

      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id));
      
      toast({
        title: "Webhook removido",
        description: "O webhook foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover o webhook. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Importante!</AlertTitle>
        <AlertDescription>
          Seus webhooks recebem notificações de eventos em tempo real. Certifique-se de que as URLs estejam acessíveis e
          configuradas corretamente.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Configure URLs para receber notificações de eventos em tempo real.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://seu-site.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Eventos</Label>
              <div className="grid grid-cols-2 gap-2">
                {events.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedEvents.includes(event)}
                      aria-label={`Ativar/desativar evento ${event}`}
                      onClick={() => handleEventChange(event)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        selectedEvents.includes(event) ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          selectedEvents.includes(event) ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRegisterWebhook} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"
                  />
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar configurações de webhook"
            )}
          </Button>
        </CardFooter>
      </Card>

      {webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Cadastrados</CardTitle>
            <CardDescription>Lista de webhooks registrados e seus eventos associados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {webhook.url} 
                      {webhook.active !== undefined && (
                        <span className={`ml-2 text-xs ${webhook.active ? 'text-green-500' : 'text-red-500'}`}>
                          {webhook.active ? '(Ativo)' : '(Inativo)'}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Eventos: {webhook.events.join(", ")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    disabled={isLoading}
                    aria-label={`Remover webhook ${webhook.url}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}