import { useState } from "react";
import { Key, Eye, EyeOff, Lock, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCredentialsSchema } from "@shared/schema";
import { z } from "zod";
import { useCredentials } from "@/hooks/use-credentials";
import { useToast } from "@/hooks/use-toast";

type CredentialsForm = z.infer<typeof insertCredentialsSchema>;

export default function CredentialsModule() {
  const [showConsumerKey, setShowConsumerKey] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);
  const { data: credentials, saveCredentialsMutation } = useCredentials();
  const { toast } = useToast();

  const form = useForm<CredentialsForm>({
    resolver: zodResolver(insertCredentialsSchema),
    defaultValues: {
      consumerKey: credentials?.consumerKey || "",
      consumerSecret: credentials?.consumerSecret || "",
    },
  });

  const onSubmit = async (data: CredentialsForm) => {
    try {
      await saveCredentialsMutation.mutateAsync(data);
      toast({
        title: "Sucesso",
        description: "Credenciais salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar credenciais",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center space-x-3">
            <Key className="text-primary" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Gerenciamento de Credenciais</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure suas credenciais Consumer Key e Consumer Secret
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Alert className="mb-6">
            <AlertDescription>
              <p className="font-medium mb-1">Onde obter suas credenciais:</p>
              <p>
                Para consumir as APIs, você deverá utilizar os códigos Consumer Key e Consumer Secret 
                disponibilizados na Área do Cliente Serpro em{" "}
                <a 
                  href="https://cliente.serpro.gov.br" 
                  className="font-medium underline text-primary" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  https://cliente.serpro.gov.br
                </a>
                . Mantenha essas informações protegidas, pois elas identificam seu usuário e seu contrato com o SERPRO.
              </p>
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="consumer-key">
                  Consumer Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="consumer-key"
                    type={showConsumerKey ? "text" : "password"}
                    placeholder="XXXXXXXXXXXXXXXXXXXX"
                    className="font-mono pr-10"
                    {...form.register("consumerKey")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConsumerKey(!showConsumerKey)}
                  >
                    {showConsumerKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {form.formState.errors.consumerKey && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.consumerKey.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="consumer-secret">
                  Consumer Secret <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="consumer-secret"
                    type={showConsumerSecret ? "text" : "password"}
                    placeholder="XXXXXXXXXXXXXXXXXXXX"
                    className="font-mono pr-10"
                    {...form.register("consumerSecret")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                  >
                    {showConsumerSecret ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {form.formState.errors.consumerSecret && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.consumerSecret.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Lock className="text-green-500" size={16} />
                <span>Suas credenciais são armazenadas de forma segura</span>
              </div>
              <Button 
                type="submit" 
                disabled={saveCredentialsMutation.isPending}
                className="bg-primary hover:bg-primary-600"
              >
                <Save className="mr-2" size={16} />
                {saveCredentialsMutation.isPending ? "Salvando..." : "Salvar Credenciais"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
