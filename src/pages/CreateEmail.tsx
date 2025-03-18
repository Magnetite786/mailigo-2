import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailForm from "@/components/email/EmailForm";
import EmailConfigForm from "@/components/email/EmailConfigForm";

export default function CreateEmail() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Email Management</h1>
      
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="config">Email Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <EmailForm />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <EmailConfigForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 