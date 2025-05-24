
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";

const ThemeSelector = () => {
  const { theme: currentTheme, setTheme, themes } = useTheme();

  const getThemePreview = (themeName: Theme) => {
    const themeConfig = themes[themeName];
    return (
      <div className="w-full h-16 rounded-lg overflow-hidden flex">
        <div className={`flex-1 bg-gradient-to-r ${themeConfig.colors.primary}`}></div>
        <div className={`w-4 ${themeConfig.colors.secondary}`}></div>
      </div>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Palette className="h-6 w-6 mr-2 text-purple-600" />
            Theme Settings
          </CardTitle>
          <CardDescription>Choose a theme that resonates with your practice</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(themes).map(([key, themeConfig]) => (
            <div key={key} className="relative">
              <Button
                variant={currentTheme === key ? "default" : "outline"}
                className="w-full h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => setTheme(key as Theme)}
              >
                {getThemePreview(key as Theme)}
                <div className="text-left w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{themeConfig.name}</span>
                    {currentTheme === key && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {themeConfig.description}
                  </span>
                </div>
              </Button>
              {currentTheme === key && (
                <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 text-center">
            Theme changes will be saved automatically and applied across your dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
