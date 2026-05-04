import { FlowerPreset } from './types';

export const FLOWER_PRESETS: FlowerPreset[] = [
  { name: 'Peony',           c1:[230,130,170], c2:[255,210,235], c3:[170,60,100],  stemC:[55,85,40],  layers:14, petalsPerLayer:9,  maxRadius:155, ruffleAmt:12, sepals:5 },
  { name: 'Pink Peony',      c1:[240,170,190], c2:[255,230,240], c3:[190,90,130],  stemC:[55,88,42],  layers:15, petalsPerLayer:10, maxRadius:150, ruffleAmt:14, sepals:6 },
  { name: 'Magenta Peony',   c1:[200,100,180], c2:[245,185,225], c3:[150,45,110],  stemC:[50,80,38],  layers:13, petalsPerLayer:9,  maxRadius:158, ruffleAmt:13, sepals:5 },
  { name: 'Red Rose',        c1:[180, 30, 50], c2:[230,70,90],   c3:[110,15,30],   stemC:[50,75,38],  layers:18, petalsPerLayer:8,  maxRadius:140, ruffleAmt:8,  sepals:5 },
  { name: 'Yellow Rose',     c1:[230,180, 40], c2:[255,225,120], c3:[170,110,20],  stemC:[55,82,40],  layers:18, petalsPerLayer:8,  maxRadius:140, ruffleAmt:8,  sepals:5 },
  { name: 'Dahlia',          c1:[200, 60,140], c2:[255,160,210], c3:[120,30, 80],  stemC:[50,80,38],  layers:10, petalsPerLayer:14, maxRadius:165, ruffleAmt:6,  sepals:6 },
  { name: 'Camellia',        c1:[220, 50, 80], c2:[255,150,170], c3:[140,20, 40],  stemC:[45,85,38],  layers:7,  petalsPerLayer:7,  maxRadius:170, ruffleAmt:4,  sepals:5 },
  { name: 'Chrysanthemum',   c1:[230,140, 60], c2:[255,210,140], c3:[160, 80, 20], stemC:[55,82,40],  layers:16, petalsPerLayer:18, maxRadius:170, ruffleAmt:5,  sepals:6 },
  { name: 'Daisy',           c1:[245,245,245], c2:[255,255,255], c3:[235,180, 40], stemC:[55,90,40],  layers:2,  petalsPerLayer:14, maxRadius:160, ruffleAmt:3,  sepals:5 },
  { name: 'Sunflower',       c1:[230,170, 30], c2:[255,215, 80], c3:[80, 40, 15],  stemC:[55,85,40],  layers:3,  petalsPerLayer:18, maxRadius:175, ruffleAmt:4,  sepals:6 },
  { name: 'Cherry Blossom',  c1:[245,170,200], c2:[255,225,235], c3:[200,100,140], stemC:[80,55,45],  layers:4,  petalsPerLayer:5,  maxRadius:140, ruffleAmt:6,  sepals:5 },
  { name: 'Lotus',           c1:[240,200,220], c2:[255,235,245], c3:[220,170, 90], stemC:[60,90,55],  layers:6,  petalsPerLayer:8,  maxRadius:165, ruffleAmt:5,  sepals:0 },
  { name: 'Iris',            c1:[110, 60,170], c2:[180,140,225], c3:[230,200, 60], stemC:[55,85,42],  layers:8,  petalsPerLayer:6,  maxRadius:155, ruffleAmt:10, sepals:0 },
  { name: 'Marigold',        c1:[230,110, 30], c2:[255,180, 60], c3:[140, 50, 10], stemC:[55,82,38],  layers:12, petalsPerLayer:14, maxRadius:155, ruffleAmt:7,  sepals:5 },
];
