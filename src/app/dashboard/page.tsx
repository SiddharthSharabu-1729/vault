import { PasswordGenerator } from "@/components/dashboard/password-generator";
import { PasswordCard } from "@/components/dashboard/password-card";
import { passwordEntries } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Vault Entries</CardTitle>
              <CardDescription>
                Manage your saved passwords and sensitive information.
              </CardDescription>
            </div>
            <PasswordGenerator>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </PasswordGenerator>
          </div>
        </CardHeader>
        <CardContent>
          {passwordEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {passwordEntries.map((entry) => (
                <PasswordCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No entries yet</h3>
              <p className="text-sm text-muted-foreground">
                Click &quot;Add New&quot; to secure your first password.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
