import { GlassCard } from "@/components/GlassCard";
import { Settings2, Bell, Palette, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your Boma-Insight experience</p>
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="price-alerts" className="text-sm text-muted-foreground">Price movement alerts</Label>
            <Switch id="price-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="risk-alerts" className="text-sm text-muted-foreground">Risk threshold warnings</Label>
            <Switch id="risk-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="market-news" className="text-sm text-muted-foreground">Market news updates</Label>
            <Switch id="market-news" />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Display</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="text-sm text-muted-foreground">Enable animations</Label>
            <Switch id="animations" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="compact" className="text-sm text-muted-foreground">Compact view</Label>
            <Switch id="compact" />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa" className="text-sm text-muted-foreground">Two-factor authentication</Label>
            <Switch id="2fa" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="session" className="text-sm text-muted-foreground">Auto-logout after inactivity</Label>
            <Switch id="session" defaultChecked />
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">About</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Boma-Insight AI — NSE Portfolio Copilot</p>
          <p>Version 1.0.0</p>
          <p className="text-xs">Built for the Nairobi Securities Exchange</p>
        </div>
      </GlassCard>
    </div>
  );
}
