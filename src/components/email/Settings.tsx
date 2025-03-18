import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface EmailConfig {
  id: string;
  email: string;
  app_password: string;
  batch_size: number;
  delay_between_batches: number;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<EmailConfig | null>(null);
  const [formData, setFormData] = useState<Omit<EmailConfig, "id">>({
    email: "",
    app_password: "",
    batch_size: 10,
    delay_between_batches: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEmailConfigs();
  }, []);

  const loadEmailConfigs = async () => {
    try {
      const { data: configs, error } = await supabase
        .from("email_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmailConfigs(configs || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading email configurations",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (selectedConfig) {
        // Update existing config
        const { error } = await supabase
          .from("email_configs")
          .update({
            email: formData.email,
            app_password: formData.app_password,
            batch_size: formData.batch_size,
            delay_between_batches: formData.delay_between_batches,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedConfig.id);

        if (error) throw error;
        toast({
          title: "Configuration updated",
          description: "Email configuration has been updated successfully",
        });
      } else {
        // Add new config
        const { error } = await supabase
          .from("email_configs")
          .insert({
            user_id: user?.id,
            ...formData,
          });

        if (error) throw error;
        toast({
          title: "Configuration saved",
          description: "New email configuration has been saved successfully",
        });
      }

      setShowAddDialog(false);
      setSelectedConfig(null);
      setFormData({
        email: "",
        app_password: "",
        batch_size: 10,
        delay_between_batches: 1,
      });
      loadEmailConfigs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving configuration",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (config: EmailConfig) => {
    setSelectedConfig(config);
    setFormData({
      email: config.email,
      app_password: config.app_password,
      batch_size: config.batch_size,
      delay_between_batches: config.delay_between_batches,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;

    try {
      const { error } = await supabase
        .from("email_configs")
        .delete()
        .eq("id", selectedConfig.id);

      if (error) throw error;

      toast({
        title: "Configuration deleted",
        description: "Email configuration has been deleted successfully",
      });

      setShowDeleteDialog(false);
      setSelectedConfig(null);
      loadEmailConfigs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting configuration",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Email Configurations</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Configuration
          </Button>
        </CardHeader>
        <CardContent>
          {emailConfigs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No email configurations found. Add one to start sending emails.
            </p>
          ) : (
            <div className="space-y-4">
              {emailConfigs.map((config) => (
                <Card key={config.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{config.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Batch Size: {config.batch_size}, Delay: {config.delay_between_batches}s
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
                          setSelectedConfig(config);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? "Edit Configuration" : "Add Configuration"}
            </DialogTitle>
            <DialogDescription>
              Enter the email and app password for sending emails.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Gmail Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appPassword">App Password</Label>
                <Input
                  id="appPassword"
                  type="password"
                  value={formData.app_password}
                  onChange={(e) =>
                    setFormData({ ...formData, app_password: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    How to generate an app password
                  </a>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.batch_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        batch_size: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min={1}
                    max={60}
                    value={formData.delay_between_batches}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delay_between_batches: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedConfig(null);
                  setFormData({
                    email: "",
                    app_password: "",
                    batch_size: 10,
                    delay_between_batches: 1,
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this email configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setSelectedConfig(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 