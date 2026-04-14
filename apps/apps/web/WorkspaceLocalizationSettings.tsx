import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WorkspaceLocalizationSettingsProps {
  workspaceId: number;
  onSave?: () => void;
}

export function WorkspaceLocalizationSettings({
  workspaceId,
  onSave,
}: WorkspaceLocalizationSettingsProps) {
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    defaultCurrency: "USD",
    dateFormat: "MM/DD/YYYY",
    timezone: "UTC",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current workspace settings
  const { data: currentSettings, isLoading } =
    trpc.workspace.getLocalizationSettings.useQuery({ workspaceId });

  // Update settings mutation
  const updateSettingsMutation =
    trpc.workspace.setLocalizationSettings.useMutation();

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        defaultLanguage: currentSettings.defaultLanguage || "en",
        defaultCurrency: currentSettings.defaultCurrency || "USD",
        dateFormat: currentSettings.dateFormat || "MM/DD/YYYY",
        timezone: currentSettings.timezone || "UTC",
      });
    }
  }, [currentSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({
        workspaceId,
        ...settings,
      });
      toast.success("Workspace localization settings updated");
      onSave?.();
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="africount-label">Default Language</label>
        <select
          className="africount-input"
          value={settings.defaultLanguage}
          onChange={(e) =>
            setSettings({ ...settings, defaultLanguage: e.target.value })
          }
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="sw">Kiswahili</option>
          <option value="ar">العربية</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Default language for new workspace members
        </p>
      </div>

      <div>
        <label className="africount-label">Default Currency</label>
        <select
          className="africount-input"
          value={settings.defaultCurrency}
          onChange={(e) =>
            setSettings({ ...settings, defaultCurrency: e.target.value })
          }
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="KES">KES - Kenyan Shilling</option>
          <option value="ZAR">ZAR - South African Rand</option>
          <option value="NGN">NGN - Nigerian Naira</option>
          <option value="EGP">EGP - Egyptian Pound</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
          <option value="JPY">JPY - Japanese Yen</option>
          <option value="CNY">CNY - Chinese Yuan</option>
          <option value="INR">INR - Indian Rupee</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Default currency for financial displays
        </p>
      </div>

      <div>
        <label className="africount-label">Date Format</label>
        <select
          className="africount-input"
          value={settings.dateFormat}
          onChange={(e) =>
            setSettings({ ...settings, dateFormat: e.target.value })
          }
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          <option value="DD.MM.YYYY">DD.MM.YYYY (DE)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Date format for all workspace members
        </p>
      </div>

      <div>
        <label className="africount-label">Timezone</label>
        <select
          className="africount-input"
          value={settings.timezone}
          onChange={(e) =>
            setSettings({ ...settings, timezone: e.target.value })
          }
        >
          <option value="UTC">UTC</option>
          <option value="EST">EST (Eastern Standard Time)</option>
          <option value="CST">CST (Central Standard Time)</option>
          <option value="MST">MST (Mountain Standard Time)</option>
          <option value="PST">PST (Pacific Standard Time)</option>
          <option value="GMT">GMT (Greenwich Mean Time)</option>
          <option value="CET">CET (Central European Time)</option>
          <option value="EAT">EAT (East Africa Time)</option>
          <option value="SAST">SAST (South Africa Standard Time)</option>
          <option value="JST">JST (Japan Standard Time)</option>
          <option value="IST">IST (India Standard Time)</option>
          <option value="AEST">AEST (Australian Eastern Standard Time)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Timezone for workspace timestamps
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving || updateSettingsMutation.isPending}
        className="w-full"
      >
        {isSaving || updateSettingsMutation.isPending
          ? "Saving..."
          : "Save Workspace Settings"}
      </Button>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-1">ℹ️ Note</p>
        <p>
          These settings will be applied as defaults to all new members joining
          this workspace. Existing members can override these in their personal
          settings.
        </p>
      </div>
    </div>
  );
}
