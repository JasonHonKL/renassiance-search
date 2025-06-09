
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings2, Brain, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentConfigProps {
  agents: string[];
  onAgentConfigSave: (config: {
    agents: string[];
    provider: string;
    model: string;
  }) => void;
}

export const AgentConfig = ({ agents, onAgentConfigSave }: AgentConfigProps) => {
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents);
  const [provider, setProvider] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const availableAgents = [
    { id: "searcher", label: "Searcher", required: false, disabled: false },
    { id: "local-retrieval", label: "Local Retrieval Searcher", required: false, disabled: false },
    { id: "executor", label: "Executor", required: false, disabled: true },
    { id: "reporter", label: "Reporter", required: false, disabled: false, group: "output" },
    { id: "summary", label: "Summary", required: false, disabled: true, group: "output" },
    { id: "email", label: "Email", required: false, disabled: true },
    { id: "notion", label: "Notion", required: false, disabled: true },
    { id: "google-drive", label: "Google Drive", required: false, disabled: true }
  ];

  const providers = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "deepseek", label: "DeepSeek" },
    { value: "ollama", label: "Ollama" }
  ];

  const modelOptions: Record<string, string[]> = {
    openai: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    deepseek: ["deepseek-chat", "deepseek-coder"],
    ollama: ["llama2", "codellama", "mistral", "neural-chat"]
  };

  // Fetch current config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:8000/get_config');
        if (response.ok) {
          const config = await response.json();
          setSelectedAgents(config.agents || []);
          setProvider(config.provider || "");
          setModel(config.model || "");
        } else {
          console.error('Failed to fetch config');
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Ensure planner is always included but not shown
  useEffect(() => {
    if (!selectedAgents.includes("planner")) {
      setSelectedAgents(prev => [...prev, "planner"]);
    }
  }, [selectedAgents]);

  const handleAgentChange = (agentId: string, checked: boolean) => {
    const agent = availableAgents.find(a => a.id === agentId);
    if (agent?.disabled) return; // Disabled agents cannot be toggled
    
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(agent => agent !== agentId));
    }
  };

  const handleDatabaseSelection = () => {
    toast({
      title: "Coming Soon",
      description: "Database/folder selection feature is currently under development.",
    });
  };

  const handleSave = async () => {
    // Validate that reporter is selected since summary is disabled
    const hasReporter = selectedAgents.includes("reporter");
    
    if (!hasReporter) {
      // Auto-select reporter if not selected
      const finalAgents = [...selectedAgents, "reporter"];
      setSelectedAgents(finalAgents);
    }

    if (!provider || !model) {
      toast({
        title: "Configuration Incomplete",
        description: "Please select both provider and model.",
        variant: "destructive",
      });
      return;
    }
    
    const finalAgents = selectedAgents.includes("planner") ? selectedAgents : [...selectedAgents, "planner"];
    const agentsToSend = finalAgents.filter(agent => agent !== "planner");
    
    onAgentConfigSave({
      agents: finalAgents,
      provider,
      model
    });
  };

  const isReporterSelected = selectedAgents.includes("reporter");

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Provider Selection */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <Brain className="h-5 w-5 text-primary" />
            LLM Provider
          </CardTitle>
          <CardDescription>Choose your language model provider</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="apple-input">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Model Selection */}
      {provider && (
        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-medium">
              <Settings2 className="h-5 w-5 text-primary" />
              Model Selection
            </CardTitle>
            <CardDescription>Choose the specific model for your provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="apple-input">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {(modelOptions[provider] || []).map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Database/Folder Selection */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <Database className="h-5 w-5 text-primary" />
            Database/Folder Selection
          </CardTitle>
          <CardDescription>Select which database or folder to use for local retrieval</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDatabaseSelection}
            variant="outline"
            className="w-full"
          >
            <Database className="mr-2 h-4 w-4" />
            Select Database/Folder (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Agent Selection */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <Users className="h-5 w-5 text-primary" />
            Agent Selection
          </CardTitle>
          <CardDescription>Select which agents to use for intelligence gathering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableAgents.map((agent) => (
            <div key={agent.id} className="flex items-center space-x-3">
              <Checkbox
                id={agent.id}
                checked={selectedAgents.includes(agent.id)}
                onCheckedChange={(checked) => handleAgentChange(agent.id, checked as boolean)}
                disabled={agent.disabled}
                className="border-primary/50"
              />
              <Label 
                htmlFor={agent.id} 
                className={`text-foreground font-medium cursor-pointer ${
                  agent.disabled ? 'text-muted-foreground opacity-60' : ''
                }`}
              >
                {agent.label}
                {agent.disabled && (
                  <span className="text-xs text-muted-foreground ml-2">(Disabled)</span>
                )}
                {agent.id === "reporter" && (
                  <span className="text-xs text-orange-500 ml-2">(Required)</span>
                )}
              </Label>
            </div>
          ))}
          
          {!isReporterSelected && (
            <div className="text-sm text-orange-500 mt-2 p-2 bg-orange-500/10 rounded">
              Note: Reporter is required and will be auto-selected if not chosen.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <Button
        onClick={handleSave}
        disabled={!provider || !model}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-lg rounded-xl disabled:opacity-50"
      >
        <Settings2 className="mr-3 h-5 w-5" />
        Save Agent Configuration
      </Button>
    </div>
  );
};
