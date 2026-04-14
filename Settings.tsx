import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, Lock, Bell, Palette, Users, LogOut } from "lucide-react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { WorkspaceLocalizationSettings } from "@/components/WorkspaceLocalizationSettings";

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "appearance" | "workspace"
  >("profile");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    commentMentions: true,
    weeklyDigest: false,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    density: "comfortable",
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveNotifications = () => {
    toast.success("Notification settings saved");
  };

  const handleSaveAppearance = () => {
    toast.success("Appearance settings saved");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "security", label: "Security", icon: Lock },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "workspace", label: "Workspace", icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as
                          | "profile"
                          | "security"
                          | "notifications"
                          | "appearance"
                          | "workspace"
                      )
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="africount-label">Full Name</label>
                      <input
                        type="text"
                        className="africount-input"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="africount-label">Email</label>
                      <input
                        type="email"
                        className="africount-input"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="africount-label">Phone</label>
                      <input
                        type="tel"
                        className="africount-input"
                        placeholder="+1 (555) 000-0000"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="africount-label">Current Password</label>
                      <input
                        type="password"
                        className="africount-input"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="africount-label">New Password</label>
                      <input
                        type="password"
                        className="africount-input"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="africount-label">Confirm Password</label>
                      <input
                        type="password"
                        className="africount-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Notification Preferences
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive email updates",
                      },
                      {
                        key: "projectUpdates",
                        label: "Project Updates",
                        desc: "Get notified about project changes",
                      },
                      {
                        key: "commentMentions",
                        label: "Comment Mentions",
                        desc: "Notify when someone mentions you",
                      },
                      {
                        key: "weeklyDigest",
                        label: "Weekly Digest",
                        desc: "Receive weekly summary email",
                      },
                    ].map((setting) => (
                      <label
                        key={setting.key}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={
                            notificationSettings[
                              setting.key as keyof typeof notificationSettings
                            ]
                          }
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [setting.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {setting.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {setting.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <Button
                    onClick={handleSaveNotifications}
                    className="mt-6"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Appearance Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="africount-label">Theme</label>
                      <select
                        className="africount-input"
                        value={appearanceSettings.theme}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            theme: e.target.value,
                          })
                        }
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    <div>
                      <label className="africount-label">Display Density</label>
                      <select
                        className="africount-input"
                        value={appearanceSettings.density}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            density: e.target.value,
                          })
                        }
                      >
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </div>
                    <div>
                      <label className="africount-label">Language</label>
                      <LanguageSwitcher />
                    </div>
                    <div>
                      <label className="africount-label">Currency</label>
                      <CurrencySwitcher />
                    </div>
                    <Button onClick={handleSaveAppearance}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Tab */}
            {activeTab === "workspace" && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Workspace Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Current Workspace
                      </div>
                      <div className="font-semibold text-foreground mt-1">
                        Default Workspace
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Members
                      </div>
                      <div className="font-semibold text-foreground mt-1">
                        3 members
                      </div>
                    </div>
                    <Button variant="outline">Manage Members</Button>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Localization Defaults
                      </h3>
                      {user?.currentWorkspaceId && (
                        <WorkspaceLocalizationSettings
                          workspaceId={user.currentWorkspaceId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="mt-8 bg-destructive/10 border border-destructive/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Danger Zone
              </h3>
              <p className="text-muted-foreground mb-4">
                Log out from your account
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
