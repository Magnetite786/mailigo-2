import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Eye, EyeOff, Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailConfig {
  id: string;
  email: string;
  app_password: string;
  created_at: string;
  user_id: string;
}

export default function EmailConfigForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    app_password: "",
  });
  const [editingConfig, setEditingConfig] = useState<EmailConfig | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<EmailConfig | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

  useEffect(() => {
    loadEmailConfigs();
  }, []);

  const loadEmailConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("email_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmailConfigs(data || []);

      if (data && data.length > 0 && !selectedConfig) {
        setSelectedConfig(data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error loading email configurations",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.app_password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: existingConfigs } = await supabase
        .from("email_configs")
        .select("id")
        .eq("email", formData.email)
        .eq("user_id", user.id)
        .neq("id", editingConfig?.id || "");

      if (existingConfigs && existingConfigs.length > 0) {
        toast({
          title: "Email already exists",
          description: "This email is already configured",
          variant: "destructive",
        });
        return;
      }

      if (editingConfig) {
        const { error } = await supabase
          .from("email_configs")
          .update({
            email: formData.email,
            app_password: formData.app_password,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingConfig.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Email configuration updated successfully",
        });
      } else {
        const { error } = await supabase.from("email_configs").insert([
          {
            email: formData.email,
            app_password: formData.app_password,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Email configuration saved successfully",
        });
      }

      setFormData({ email: "", app_password: "" });
      setEditingConfig(null);
      loadEmailConfigs();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowUpdateDialog(false);
    }
  };

  const handleDelete = async (config: EmailConfig) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("email_configs")
        .delete()
        .eq("id", config.id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Email configuration deleted successfully",
      });
      loadEmailConfigs();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setConfigToDelete(null);
    }
  };

  const handleEdit = (config: EmailConfig) => {
    setEditingConfig(config);
    setFormData({
      email: config.email,
      app_password: config.app_password,
    });
    setShowUpdateDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Email Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="app_password">App Password</Label>
              <div className="relative">
                <Input
                  id="app_password"
                  type={showPassword ? "text" : "password"}
                  value={formData.app_password}
                  onChange={(e) =>
                    setFormData({ ...formData, app_password: e.target.value })
                  }
                  placeholder="Enter app password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingConfig ? "Update" : "Save"} Configuration
            </Button>
          </form>
        </CardContent>
      </Card>

      {emailConfigs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{config.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Added on{" "}
                      {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(config)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setConfigToDelete(config);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the email configuration for{" "}
              {configToDelete?.email}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => configToDelete && handleDelete(configToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the configuration for{" "}
              {editingConfig?.email}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setEditingConfig(null);
              setFormData({ email: "", app_password: "" });
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 