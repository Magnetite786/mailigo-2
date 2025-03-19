import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Plus, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface EmailConfig {
  id: string;
  email: string;
  app_password: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
}

export default function EmailConfigForm() {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newAppPassword, setNewAppPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load email configurations from Supabase
  useEffect(() => {
    loadEmailConfigs();
  }, [user]);

  const loadEmailConfigs = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage email configurations.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("email_config")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data received from the server");
      }

      setEmailConfigs(data);
    } catch (error) {
      console.error("Error loading email configs:", error);
      toast({
        title: "Error loading configurations",
        description: error instanceof Error ? error.message : "Failed to load email configurations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!user) return;

    if (!newEmail || !newAppPassword) {
      toast({
        title: "Error",
        description: "Please fill in both email and app password fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check if this is the first config (make it default)
      const isFirst = emailConfigs.length === 0;

      const { data, error } = await supabase
        .from("email_config")
        .insert([
          {
            email: newEmail,
            app_password: newAppPassword,
            user_id: user.id,
            is_default: isFirst,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setEmailConfigs([data, ...emailConfigs]);
      setNewEmail("");
      setNewAppPassword("");

      toast({
        title: "Success",
        description: "Email configuration saved successfully.",
      });
    } catch (error) {
      console.error("Error adding config:", error);
      toast({
        title: "Error",
        description: "Failed to save email configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("email_config")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      const updatedConfigs = emailConfigs.filter(config => config.id !== id);
      
      // If we deleted the default config, make the first remaining one default
      if (emailConfigs.find(config => config.id === id)?.is_default && updatedConfigs.length > 0) {
        const { error: updateError } = await supabase
          .from("email_config")
          .update({ is_default: true })
          .eq("id", updatedConfigs[0].id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
        updatedConfigs[0].is_default = true;
      }

      setEmailConfigs(updatedConfigs);
      toast({
        title: "Success",
        description: "Email configuration deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting config:", error);
      toast({
        title: "Error",
        description: "Failed to delete email configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDefault = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First, remove default from all configs
      const { error: resetError } = await supabase
        .from("email_config")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (resetError) throw resetError;

      // Then set the selected config as default
      const { error } = await supabase
        .from("email_config")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEmailConfigs(configs =>
        configs.map(config => ({
          ...config,
          is_default: config.id === id,
        }))
      );

      toast({
        title: "Success",
        description: "Default email updated successfully.",
      });
    } catch (error) {
      console.error("Error updating default:", error);
      toast({
        title: "Error",
        description: "Failed to update default email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure your email accounts for sending campaigns. Add Gmail accounts and their app passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : emailConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No email configurations found.</p>
              <p className="text-sm">Add your first email configuration below.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emailConfigs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.email}</span>
                        {config.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showPasswords[config.id] ? "text" : "password"}
                          value={config.app_password}
                          className="w-64"
                          readOnly
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePasswordVisibility(config.id)}
                        >
                          {showPasswords[config.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!config.is_default && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.is_default}
                            onCheckedChange={() => toggleDefault(config.id)}
                            disabled={isLoading}
                          />
                          <Label className="text-sm">Make Default</Label>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteConfig(config.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 