import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Image as ImageIcon, Ban, Video, Mic, Monitor } from "lucide-react";

const BACKGROUND_IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", name: "Mountains" },
  { id: 2, url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", name: "Forest" },
  { id: 3, url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80", name: "Nature" },
  { id: 4, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", name: "Beach" },
  { id: 5, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", name: "Snowy" },
  { id: 6, url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80", name: "Lake" },
];

export function VideoSettingsModal({
  open,
  onOpenChange,
  videoBgRef,
  meeting,
  currentEffect,
  onEffectChange,
}) {
  const [blurStrength, setBlurStrength] = useState(20);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [noiseReduction, setNoiseReduction] = useState(false);

  const applyBlur = async () => {
    if (!meeting || !videoBgRef.current) return;
    try {
      if (currentEffect.current) {
        meeting.self.removeVideoMiddleware(currentEffect.current);
      }
      const blurMiddleware = await videoBgRef.current.createBackgroundBlurVideoMiddleware(blurStrength);
      meeting.self.addVideoMiddleware(blurMiddleware);
      currentEffect.current = blurMiddleware;
      onEffectChange("blur");
    } catch (err) {
      console.error("Failed to apply blur:", err);
    }
  };

  const applyBackground = async (imageUrl) => {
    if (!meeting || !videoBgRef.current) return;
    try {
      if (currentEffect.current) {
        meeting.self.removeVideoMiddleware(currentEffect.current);
      }
      const imageMiddleware = await videoBgRef.current.createStaticBackgroundVideoMiddleware(imageUrl);
      meeting.self.addVideoMiddleware(imageMiddleware);
      currentEffect.current = imageMiddleware;
      onEffectChange("image");
      setSelectedBackground(imageUrl);
    } catch (err) {
      console.error("Failed to apply background:", err);
    }
  };

  const removeEffect = async () => {
    if (!meeting || !currentEffect.current) return;
    try {
      meeting.self.removeVideoMiddleware(currentEffect.current);
      currentEffect.current = null;
      onEffectChange("none");
      setSelectedBackground(null);
    } catch (err) {
      console.error("Failed to remove effect:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1A2332] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="effects" className="mt-4">
          <TabsList className="grid grid-cols-2 bg-gray-800">
            <TabsTrigger value="effects" className="data-[state=active]:bg-[#D4AF7A]">
              <Sparkles className="w-4 h-4 mr-2" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="quality" className="data-[state=active]:bg-[#D4AF7A]">
              <Monitor className="w-4 h-4 mr-2" />
              Quality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="effects" className="mt-4 space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Background Effect</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={currentEffect.current === "none" || !currentEffect.current ? "default" : "outline"}
                  onClick={removeEffect}
                  className={currentEffect.current === "none" || !currentEffect.current ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  No Effect
                </Button>
                <Button
                  variant={currentEffect.current === "blur" ? "default" : "outline"}
                  onClick={applyBlur}
                  className={currentEffect.current === "blur" ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Blur
                </Button>
              </div>
            </div>

            {currentEffect.current === "blur" && (
              <div>
                <Label className="text-gray-300 mb-2 block">Blur Intensity: {blurStrength}</Label>
                <Slider
                  value={[blurStrength]}
                  onValueChange={([value]) => setBlurStrength(value)}
                  min={5}
                  max={100}
                  step={5}
                  className="py-2"
                />
              </div>
            )}

            <div>
              <Label className="text-gray-300 mb-2 block flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Virtual Backgrounds
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {BACKGROUND_IMAGES.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => applyBackground(bg.url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedBackground === bg.url ? "border-[#D4AF7A]" : "border-transparent hover:border-gray-500"
                    }`}
                  >
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-1 text-center truncate">
                      {bg.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Noise Reduction</Label>
                <p className="text-xs text-gray-400">Reduce background noise (requires premium)</p>
              </div>
              <Switch
                checked={noiseReduction}
                onCheckedChange={setNoiseReduction}
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 italic">
              Noise reduction is a premium feature. Contact support to enable.
            </p>

            <div className="border-t border-gray-700 pt-4">
              <Label className="text-gray-300 mb-2 block">Recording Quality</Label>
              <div className="bg-gray-800 rounded-lg p-3 text-sm">
                <p className="text-white">1080p Full HD</p>
                <p className="text-gray-400 text-xs">1920 x 1080 resolution</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
