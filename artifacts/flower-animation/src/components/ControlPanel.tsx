import React from 'react';
import { FLOWER_PRESETS } from '../sketch/flowers';
import { SketchParams } from '../sketch/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Zap, Play, Pause, EyeOff, Shuffle, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ControlPanelProps {
  params: SketchParams;
  setParams: React.Dispatch<React.SetStateAction<SketchParams>>;
  onGlitch: () => void;
  onRestart: () => void;
  onForceWilt: () => void;
  onSave: () => void;
  onRandomize: () => void;
  onReset: () => void;
}

export function ControlPanel({ params, setParams, onGlitch, onRestart, onForceWilt, onSave, onRandomize, onReset }: ControlPanelProps) {
  const flower = FLOWER_PRESETS[params.flowerIndex % FLOWER_PRESETS.length];
  const accentColor = `rgb(${flower.c2[0]}, ${flower.c2[1]}, ${flower.c2[2]})`;

  const updateParam = <K extends keyof SketchParams>(key: K, value: SketchParams[K]) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const handleColorChange = (key: keyof NonNullable<SketchParams['customColors']>, hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    
    setParams(p => {
      const customColors = p.customColors || {
        c1: [...flower.c1] as [number,number,number],
        c2: [...flower.c2] as [number,number,number],
        c3: [...flower.c3] as [number,number,number],
        stemC: [...flower.stemC] as [number,number,number]
      };
      return { ...p, customColors: { ...customColors, [key]: rgb } };
    });
  };

  const currentColors = params.customColors || flower;

  return (
    <div 
      className="w-80 h-full max-h-[85vh] flex flex-col backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      style={{ '--ring': accentColor } as React.CSSProperties}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-serif italic text-lg tracking-wide">Peonia</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-help" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
                <span className="font-mono text-xs">?</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-black/90 border-white/10 text-zinc-300 backdrop-blur-xl font-mono text-xs z-50">
              <div className="space-y-2">
                <div className="flex justify-between"><span>Space</span><span>Pause/Play</span></div>
                <div className="flex justify-between"><span>H</span><span>Toggle UI</span></div>
                <div className="flex justify-between"><span>G</span><span>Trigger Glitch</span></div>
                <div className="flex justify-between"><span>R</span><span>Restart</span></div>
                <div className="flex justify-between"><span>S</span><span>Snapshot</span></div>
                <div className="flex justify-between"><span>←/→</span><span>Prev/Next</span></div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" data-testid="button-hide-ui" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full" onClick={() => updateParam('hideUI', true)}>
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs">
        <Tabs defaultValue="flower" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/5 grid grid-cols-5 mb-4 h-10">
            <TabsTrigger value="flower" data-testid="tab-flower" className="data-[state=active]:bg-white/10 text-[10px] px-1">Type</TabsTrigger>
            <TabsTrigger value="motion" data-testid="tab-motion" className="data-[state=active]:bg-white/10 text-[10px] px-1">Move</TabsTrigger>
            <TabsTrigger value="render" data-testid="tab-render" className="data-[state=active]:bg-white/10 text-[10px] px-1">Look</TabsTrigger>
            <TabsTrigger value="color" data-testid="tab-color" className="data-[state=active]:bg-white/10 text-[10px] px-1">Hue</TabsTrigger>
            <TabsTrigger value="extra" data-testid="tab-extra" className="data-[state=active]:bg-white/10 text-[10px] px-1">More</TabsTrigger>
          </TabsList>

          <TabsContent value="flower" className="space-y-6 focus:outline-none">
            <div className="space-y-3">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Preset</Label>
              <Select value={params.flowerIndex.toString()} onValueChange={v => updateParam('flowerIndex', parseInt(v))}>
                <SelectTrigger data-testid="select-flower" className="bg-black/50 border-white/10 h-10">
                  <SelectValue placeholder="Select flower" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 max-h-[300px] z-50">
                  {FLOWER_PRESETS.map((f, i) => (
                    <SelectItem key={i} value={i.toString()} data-testid={`option-flower-${i}`} className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: `rgb(${f.c2[0]},${f.c2[1]},${f.c2[2]})` }} />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                data-testid="button-randomize-preset"
                className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white h-9 font-mono"
                onClick={() => updateParam('flowerIndex', Math.floor(Math.random() * FLOWER_PRESETS.length))}
              >
                <Shuffle className="w-3 h-3 mr-2" /> Randomize Preset
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Arrangement</Label>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Label>Bouquet</Label>
                  <span className="text-[10px] text-zinc-500 normal-case">Render as a wrapped bunch</span>
                </div>
                <Switch data-testid="switch-bouquet" checked={params.bouquet} onCheckedChange={v => updateParam('bouquet', v)} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Lifecycle</Label>
              
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Bloom Speed</Label><span>{params.bloomSpeed.toFixed(3)}</span></div>
                <Slider data-testid="slider-bloom-speed" value={[params.bloomSpeed]} min={0.001} max={0.05} step={0.001} onValueChange={v => updateParam('bloomSpeed', v[0])} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Wilt Speed</Label><span>{params.wiltSpeed.toFixed(3)}</span></div>
                <Slider data-testid="slider-wilt-speed" value={[params.wiltSpeed]} min={0.005} max={0.2} step={0.001} onValueChange={v => updateParam('wiltSpeed', v[0])} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Duration (s)</Label><span>{params.interactiveDuration}</span></div>
                <Slider data-testid="slider-duration" value={[params.interactiveDuration]} min={5} max={60} step={1} onValueChange={v => updateParam('interactiveDuration', v[0])} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" data-testid="button-force-wilt" className="bg-white/5 border-white/10 h-8" onClick={onForceWilt}>Wilt Now</Button>
                <Button variant="outline" data-testid="button-restart" className="bg-white/5 border-white/10 h-8" onClick={onRestart}>Restart</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motion" className="space-y-6 focus:outline-none">
            <div className="flex items-center justify-between">
              <Label>Auto Rotate</Label>
              <Switch data-testid="switch-auto-rotate" checked={params.autoRotate} onCheckedChange={v => updateParam('autoRotate', v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Rotation Speed</Label><span>{params.rotationSpeed.toFixed(1)}</span></div>
              <Slider data-testid="slider-rotation-speed" value={[params.rotationSpeed]} min={0} max={3} step={0.1} onValueChange={v => updateParam('rotationSpeed', v[0])} disabled={!params.autoRotate} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Mouse Influence</Label><span>{params.mouseInfluence.toFixed(1)}</span></div>
              <Slider data-testid="slider-mouse-influence" value={[params.mouseInfluence]} min={0} max={2} step={0.1} onValueChange={v => updateParam('mouseInfluence', v[0])} />
            </div>
          </TabsContent>

          <TabsContent value="render" className="space-y-6 focus:outline-none">
            <div className="space-y-3">
              <Label>Render Mode</Label>
              <Select value={params.forcedRenderMode} onValueChange={v => updateParam('forcedRenderMode', v as any)}>
                <SelectTrigger data-testid="select-render-mode" className="bg-black/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 z-50">
                  <SelectItem value="auto">Auto Cycle</SelectItem>
                  <SelectItem value="raw">Clean (No FX)</SelectItem>
                  <SelectItem value="ascii">ASCII</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="pixels">Pixels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>ASCII Charset</Label>
              <Select value={params.asciiCharSet} onValueChange={v => updateParam('asciiCharSet', v as any)}>
                <SelectTrigger data-testid="select-charset" className="bg-black/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 z-50">
                  <SelectItem value="letters">Letters & Numbers</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="symbols">Symbols</SelectItem>
                  <SelectItem value="blocks">Blocks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between"><Label>Density Min</Label><span>{params.densityMin}</span></div>
              <Slider data-testid="slider-density-min" value={[params.densityMin]} min={4} max={40} step={1} onValueChange={v => updateParam('densityMin', v[0])} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Density Max</Label><span>{params.densityMax}</span></div>
              <Slider data-testid="slider-density-max" value={[params.densityMax]} min={4} max={40} step={1} onValueChange={v => updateParam('densityMax', v[0])} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Cycle Speed (s)</Label><span>{params.modeCycleInterval === 0 ? 'Freeze' : params.modeCycleInterval.toFixed(1)}</span></div>
              <Slider data-testid="slider-cycle-speed" value={[params.modeCycleInterval]} min={0} max={5} step={0.2} onValueChange={v => updateParam('modeCycleInterval', v[0])} disabled={params.forcedRenderMode !== 'auto'} />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-400 uppercase tracking-wider">Glitch FX</Label>
                <Switch data-testid="switch-glitch" checked={params.glitchEnabled} onCheckedChange={v => updateParam('glitchEnabled', v)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Frequency</Label><span>{params.glitchFrequency.toFixed(1)}</span></div>
                <Slider data-testid="slider-glitch-frequency" value={[params.glitchFrequency]} min={0.1} max={3} step={0.1} onValueChange={v => updateParam('glitchFrequency', v[0])} disabled={!params.glitchEnabled} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Intensity</Label><span>{params.glitchIntensity.toFixed(1)}</span></div>
                <Slider data-testid="slider-glitch-intensity" value={[params.glitchIntensity]} min={0.1} max={3} step={0.1} onValueChange={v => updateParam('glitchIntensity', v[0])} disabled={!params.glitchEnabled} />
              </div>
              <Button variant="outline" data-testid="button-trigger-glitch" className="w-full bg-white/5 border-white/10 h-8 mt-2" onClick={onGlitch} disabled={!params.glitchEnabled}>
                <Zap className="w-3 h-3 mr-2" /> Trigger Now
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="color" className="space-y-6 focus:outline-none">
            <div className="flex items-center justify-between">
              <Label>Use Custom Palette</Label>
              <Switch data-testid="switch-custom-palette" checked={params.customColors !== null} onCheckedChange={v => {
                if (v) {
                  updateParam('customColors', {
                    c1: [...flower.c1] as [number,number,number],
                    c2: [...flower.c2] as [number,number,number],
                    c3: [...flower.c3] as [number,number,number],
                    stemC: [...flower.stemC] as [number,number,number]
                  });
                } else {
                  updateParam('customColors', null);
                }
              }} />
            </div>

            <div className={`space-y-4 ${!params.customColors ? 'opacity-50 pointer-events-none' : ''}`}>
              <ColorPicker label="Shadow Tone (C1)" color={currentColors.c1} onChange={h => handleColorChange('c1', h)} testId="color-c1" />
              <ColorPicker label="Highlight Tone (C2)" color={currentColors.c2} onChange={h => handleColorChange('c2', h)} testId="color-c2" />
              <ColorPicker label="Core/Stamen (C3)" color={currentColors.c3} onChange={h => handleColorChange('c3', h)} testId="color-c3" />
              <ColorPicker label="Stem & Leaves" color={currentColors.stemC} onChange={h => handleColorChange('stemC', h)} testId="color-stem" />
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <ColorPicker 
                label="Background Color" 
                color={params.bgColor} 
                onChange={h => {
                  const rgb = hexToRgb(h);
                  if (rgb) updateParam('bgColor', rgb);
                }} 
                testId="color-bg"
              />
            </div>
          </TabsContent>

          <TabsContent value="extra" className="space-y-4 focus:outline-none">
            <Button data-testid="button-randomize-all" variant="outline" className="w-full bg-white/5 border-white/10" onClick={onRandomize}>
              <Shuffle className="w-4 h-4 mr-2" /> Randomize Everything
            </Button>
            <Button data-testid="button-reset" variant="outline" className="w-full bg-white/5 border-white/10" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
            </Button>
            <Button data-testid="button-save-snapshot" variant="default" className="w-full bg-white text-black hover:bg-zinc-200 mt-4" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" /> Save Snapshot
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-2">
        <Button 
          variant="outline" 
          size="icon"
          data-testid="button-play-pause"
          className="w-10 h-10 rounded-full bg-white/5 border-white/10 hover:bg-white/20 text-white" 
          onClick={() => updateParam('paused', !params.paused)}
        >
          {params.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button 
          variant="default"
          data-testid="button-save-footer"
          className="flex-1 bg-white text-black hover:bg-zinc-200" 
          onClick={onSave}
        >
          <Save className="w-4 h-4 mr-2" /> Snapshot
        </Button>
      </div>
    </div>
  );
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function ColorPicker({ label, color, onChange, testId }: { label: string, color: [number,number,number], onChange: (h: string) => void, testId: string }) {
  const hex = rgbToHex(color[0], color[1], color[2]);
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20">
        <input 
          type="color" 
          value={hex}
          data-testid={testId}
          onChange={e => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
        />
      </div>
    </div>
  );
}
