
'use client';

import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, Palette, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-provider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme, themes, useSystemTheme, setUseSystemTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  // Ensure the component is mounted before using theme-dependent logic
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null; // or a loading skeleton
  }

  const handleSystemThemeToggle = (checked: boolean) => {
    setUseSystemTheme(checked);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your application preferences.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Choose the display language for the application.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-2 max-w-sm">
            <Label htmlFor="language-select" className="flex items-center gap-2">
              <Languages className="h-5 w-5" /> Application Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language-select">
                <SelectValue placeholder="Select language..." />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Theme Preferences</CardTitle>
          <CardDescription>Customize the look and feel of your application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="system-theme-toggle" className="text-base">
                Match System Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically switch between light and dark themes based on your OS settings.
              </p>
            </div>
            <Switch
              id="system-theme-toggle"
              checked={useSystemTheme}
              onCheckedChange={handleSystemThemeToggle}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base">Select a Theme</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((t) => (
                <div key={t.name}>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-24 justify-start p-4',
                      !useSystemTheme && theme === t.name && 'ring-2 ring-primary'
                    )}
                    onClick={() => setTheme(t.name)}
                    disabled={useSystemTheme}
                  >
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                             {(!useSystemTheme && theme === t.name) && <Check className="h-4 w-4 text-primary" />}
                             <span className="text-lg font-semibold">{t.label}</span>
                        </div>
                        <div className="flex gap-1">
                            {Object.values(t.colors[resolvedTheme || 'light']).map((color, index) => (
                                <div
                                    key={index}
                                    className="h-6 w-6 rounded-full"
                                    style={{ backgroundColor: `hsl(${color})` }}
                                />
                            ))}
                        </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
             {useSystemTheme && (
                <p className="text-sm text-muted-foreground text-center">
                    Disable "Match System Theme" to manually select a theme.
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
