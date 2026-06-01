import p5 from "p5";
import { SketchParams, FlowerPreset } from "./types";
import { FLOWER_PRESETS } from "./flowers";

export function createPeoniaSketch(
  getParams: () => SketchParams,
  callbacks: {
    onPhaseChange: (phase: string) => void;
    onReady: () => void;
    onProgress: (pct: number) => void;
  }
) {
  return function(p: p5) {
    const BUF_W = 680, BUF_H = 680;
    let buf: p5.Graphics;
    let ctx: CanvasRenderingContext2D;

    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'.split('');
    const charSets = {
      letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'.split(''),
      binary: '01'.split(''),
      symbols: '@#$%&*+=~^?!'.split(''),
      blocks: '░▒▓█'.split('')
    };

    let phase = 'growing';
    let phaseT = 0;

    let bloom = 0;
    let bloomTarget = 1;
    
    let renderMode = 0, prevMode = 0, modeT = 1;
    
    let grid = 4, gridTarget = 4;
    let densDir = 1, densTimer = 0;
    
    let mInfX = 0, mInfY = 0;
    let t = 0;
    
    let rotX = 0, rotY = 0, rotZ = 0;
    let autoRotX = 0, autoRotY = 0, autoRotZ = 0;
    let dragRotX = 0, dragRotY = 0;
    let dragVelX = 0, dragVelY = 0;
    let isDragging = false;
    let lastDragX = 0, lastDragY = 0;
    let rotEaseIn = 0;
    
    let loadingPhase = true;
    let warmFrames = 0;
    const WARM_TARGET = 60;
    
    let glitchTimer = 0;
    let glitchActive = false;
    let glitchIntensityVal = 0;
    let glitchSlices: any[] = [];
    
    let wilt = 0;
    let lastWilt = -1;

    let lastPresetIdx = -1;

    const easeInOutCubic = (x: number) => x < 0.5 ? 4*x*x*x : 1 - p.pow(-2*x+2, 3) / 2;
    const easeOutQuart = (x: number) => 1 - p.pow(1 - x, 4);

    // Provide imperative handles to React via the p5 instance
    (p as any).triggerGlitch = () => {
      triggerGlitchManual();
    };
    (p as any).restartBloom = () => {
      startElement(getParams().flowerIndex);
    };
    (p as any).forceWilt = () => {
      if (phase !== 'wilting' && phase !== 'waiting') {
        phase = 'wilting';
        phaseT = 0;
        callbacks.onPhaseChange(phase);
        triggerGlitchManual();
      }
    };

    p.setup = function() {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.pixelDensity(1);
      p.textFont('Courier New, monospace');
      p.textAlign(p.CENTER, p.CENTER);
      p.noStroke();

      buf = p.createGraphics(BUF_W, BUF_H);
      buf.pixelDensity(1);
      buf.noSmooth();
      const canvasEl = (buf as any).canvas as HTMLCanvasElement;
      canvasEl.getContext('2d', { willReadFrequently: true });

      ctx = p.drawingContext as CanvasRenderingContext2D;

      startElement(getParams().flowerIndex);
      document.body.style.cursor = 'grab';
    };

    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.mousePressed = function(evt?: MouseEvent) {
      // Only start drag when clicking on the p5 canvas itself (not UI overlays)
      const target = evt?.target as HTMLElement | undefined;
      if (target && target.tagName !== 'CANVAS') return;
      isDragging = true;
      lastDragX = p.mouseX;
      lastDragY = p.mouseY;
      dragVelX = 0;
      dragVelY = 0;
      document.body.style.cursor = 'grabbing';
    };

    // End any drag reliably, even if the pointer is released outside the canvas
    // or the window loses focus mid-drag.
    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = 'grab';
    };
    p.mouseReleased = endDrag;
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('blur', endDrag);

    // Restore the default cursor and detach listeners when the sketch is removed.
    (p as any).cleanup = () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('blur', endDrag);
      document.body.style.cursor = '';
    };

    (p as any).resetRotation = () => {
      dragRotX = 0;
      dragRotY = 0;
      dragVelX = 0;
      dragVelY = 0;
    };

    function startElement(idx: number) {
      bloom = 0;
      bloomTarget = 1;
      lastWilt = -1;
      wilt = 0;
      phase = 'growing';
      phaseT = 0;
      callbacks.onPhaseChange(phase);
      
      const params = getParams();
      grid = params.densityMin;
      gridTarget = params.densityMin;
      densDir = 1;
      densTimer = 0;
      modeT = 1;
    }

    function triggerGlitchManual() {
      const params = getParams();
      glitchActive = true;
      glitchIntensityVal = p.random(0.4, 1.0) * params.glitchIntensity;
      glitchSlices = [];
      const scaleF = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
      const rW = BUF_W * scaleF, rH = BUF_H * scaleF;
      const fOx = (p.width  - rW) / 2 + mInfX;
      const fOy = (p.height - rH) / 2 + mInfY;
      const numSlices = p.floor(p.random(3, 10));
      for (let i = 0; i < numSlices; i++) {
        const sy = p.random(fOy, fOy + rH);
        const sh = p.min(p.random(2, rH * 0.08), fOy + rH - sy);
        glitchSlices.push({
          y: sy, h: sh, fx: fOx, fw: rW,
          offset: p.random(-80, 80) * glitchIntensityVal,
          colorShift: p.random() < 0.4,
          duration: p.random(0.08, 0.3)
        });
      }
    }

    p.draw = function() {
      const params = getParams();
      const dt = p.deltaTime / 1000;
      const baseF = FLOWER_PRESETS[params.flowerIndex % FLOWER_PRESETS.length];
      
      if (lastPresetIdx !== params.flowerIndex && !loadingPhase) {
        lastPresetIdx = params.flowerIndex;
        startElement(params.flowerIndex);
      }
      
      const f = params.customColors ? {
        ...baseF, ...params.customColors
      } : baseF;

      chars = charSets[params.asciiCharSet] || charSets.letters;

      if (loadingPhase) {
        p.background(params.bgColor[0], params.bgColor[1], params.bgColor[2]);
        bloom = p.min(0.5, warmFrames / WARM_TARGET * 0.5);
        drawFlowerToBuffer(f, bloom, 0);
        warmFrames++;
        const pct = p.min(100, p.floor(warmFrames / WARM_TARGET * 100));
        callbacks.onProgress(pct);
        if (warmFrames >= WARM_TARGET) {
          loadingPhase = false;
          callbacks.onReady();
        }
        return;
      }

      p.background(params.bgColor[0], params.bgColor[1], params.bgColor[2]);
      
      if (!params.paused) {
        t += 0.016;

        rotEaseIn = p.min(1, rotEaseIn + dt * 0.08);
        const re = easeInOutCubic(rotEaseIn);

        if (params.autoRotate) {
          autoRotY += dt * 0.3  * re * params.rotationSpeed;
          autoRotX += dt * 0.12 * p.sin(t * 0.15) * re * params.rotationSpeed;
          autoRotZ += dt * 0.08 * p.sin(t * 0.09 + 1.5) * re * params.rotationSpeed;
        }

        if (phase === 'growing') {
          bloom += (bloomTarget - bloom) * params.bloomSpeed;
          phaseT += dt;
          if (bloom > 0.98) { 
            bloom = 1; 
            phase = 'interactive'; 
            phaseT = 0; 
            callbacks.onPhaseChange(phase);
          }
        }

        if (params.modeCycleInterval > 0) {
          densTimer += dt;
          if (densTimer > params.modeCycleInterval) {
            densTimer = 0;
            if (params.glitchEnabled) triggerGlitchManual();
            prevMode = renderMode;
            renderMode = (renderMode + 1) % 3;
            modeT = 0;
            if (densDir === 1) { gridTarget = params.densityMax; densDir = -1; }
            else               { gridTarget = params.densityMin; densDir =  1; }
          }
        } else {
          gridTarget = params.densityMin;
        }

        if (phase === 'interactive') {
          phaseT += dt;
          if (phaseT > params.interactiveDuration) { 
            phase = 'wilting'; 
            phaseT = 0; 
            if (params.glitchEnabled) triggerGlitchManual(); 
            callbacks.onPhaseChange(phase);
          }
        }

        if (phase === 'wilting') {
          wilt = p.min(1, wilt + dt * params.wiltSpeed);
          phaseT += dt;
          if (wilt > 0.95) { 
            phase = 'waiting'; 
            phaseT = 0; 
            callbacks.onPhaseChange(phase);
          }
        }

        if (phase === 'waiting') {
          phaseT += dt;
          if (phaseT > 0.6) {
            if (params.modeCycleInterval > 0) {
              prevMode = renderMode;
              renderMode = (renderMode + 1) % 3;
              modeT = 0;
            }
            if (params.glitchEnabled) triggerGlitchManual();
            // We just reset the bloom locally instead of changing the global React state index to let the UI control the index
            startElement(params.flowerIndex);
          }
        }

        grid += (gridTarget - grid) * 0.08;
        modeT = p.min(1, modeT + dt * 4.0);

        if (params.glitchEnabled) {
          updateGlitch(dt);
          glitchTimer -= dt;
          if (glitchTimer <= 0 && !glitchActive) {
            glitchTimer = p.random(3, 7) / Math.max(0.01, params.glitchFrequency);
            if (p.random() < 0.4 * params.glitchFrequency) triggerGlitchManual();
          }
        } else {
          glitchActive = false;
        }
      }

      // Click-and-drag rotation with momentum
      if (isDragging) {
        const dx = p.mouseX - lastDragX;
        const dy = p.mouseY - lastDragY;
        dragVelY = dx / p.width  * 3.0;
        dragVelX = dy / p.height * 2.0;
        dragRotY += dragVelY;
        dragRotX += dragVelX;
        lastDragX = p.mouseX;
        lastDragY = p.mouseY;
      } else {
        // Apply momentum then decay it
        dragRotY += dragVelY;
        dragRotX += dragVelX;
        dragVelX *= 0.94;
        dragVelY *= 0.94;
      }

      // Clamp vertical tilt so the flower never flips fully upside down
      dragRotX = p.constrain(dragRotX, -1.25, 1.25);
      const targetRotX = autoRotX + dragRotX * params.mouseInfluence;
      const targetRotY = autoRotY + dragRotY * params.mouseInfluence;
      // Smoothly ease the actual rotation toward the target for fluid motion
      const ease = isDragging ? 0.32 : 0.16;
      rotX += (targetRotX - rotX) * ease;
      rotY += (targetRotY - rotY) * ease;
      rotZ += (autoRotZ - rotZ) * 0.16;

      // Decay any leftover translation from previous versions
      mInfX *= 0.9;
      mInfY *= 0.9;

      drawFlowerToBuffer(f, bloom, wilt);
      renderToScreen();
      if (params.glitchEnabled) {
        drawGlitchOverlay();
      }
    };

    function updateGlitch(dt: number) {
      if (!glitchActive) return;
      let allDone = true;
      for (const s of glitchSlices) {
        s.duration -= dt;
        if (s.duration > 0) allDone = false;
        else s.offset *= 0.7;
      }
      if (allDone) { glitchActive = false; glitchSlices = []; }
    }

    function drawGlitchOverlay() {
      if (!glitchActive || !glitchSlices.length) return;
      for (const s of glitchSlices) {
        if (p.abs(s.offset) < 0.5) continue;
        const sx = p.floor(s.fx), sy = p.floor(s.y), sw = p.floor(s.fw), sh = p.floor(s.h);
        if (sw < 1 || sh < 1) continue;
        if (s.colorShift) {
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx + s.offset*1.5, sy, sw, sh);
          ctx.globalAlpha = 0.45;
          ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx - s.offset, sy, sw, sh);
          ctx.restore();
        } else {
          ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx + s.offset, sy, sw, sh);
        }
      }
    }

    function drawFlowerToBuffer(f: FlowerPreset, bl: number, wl: number) {
      buf.background(0);
      buf.noStroke();
      if (getParams().bouquet) {
        drawBouquet(f, bl, wl);
        buf.loadPixels();
        return;
      }
      const stemProgress = p.constrain(bl * 3, 0, 1);
      const flowerBloom  = p.constrain((bl - 0.15) / 0.85, 0, 1);
      const wiltDroop    = wl * 55;
      const flowerCX     = BUF_W / 2;
      const flowerCY     = BUF_H * 0.38 + wiltDroop;
      drawStem(buf, f, stemProgress, wl, flowerCX, flowerCY);
      drawPeony3D(buf, f, flowerBloom, wl, flowerCX, flowerCY);
      buf.loadPixels();
    }

    // Layout of flowers within a bouquet: offsets from the cluster center.
    const BOUQUET_LAYOUT = [
      { dx: 0,    dy: -46, s: 0.58, delay: 0.00 },
      { dx: -120, dy: -2,  s: 0.50, delay: 0.10 },
      { dx: 122,  dy: 2,   s: 0.50, delay: 0.08 },
      { dx: -64,  dy: 58,  s: 0.44, delay: 0.18 },
      { dx: 66,   dy: 54,  s: 0.46, delay: 0.14 },
    ];

    function drawBouquet(f: FlowerPreset, bl: number, wl: number) {
      const flowerBloom = p.constrain((bl - 0.15) / 0.85, 0, 1);
      const wiltDroop   = wl * 36;
      const tieX        = BUF_W / 2;
      const tieY        = BUF_H * 0.80;
      const clusterCX   = BUF_W / 2;
      const clusterCY   = BUF_H * 0.30 + wiltDroop;
      const stemGrow    = p.constrain(bl * 2.2, 0, 1);

      // 1) Converging stems behind the flowers
      for (const a of BOUQUET_LAYOUT) {
        drawBouquetStem(f, clusterCX + a.dx, clusterCY + a.dy + 24, tieX, tieY, stemGrow, wl);
      }

      // 2) Paper wrap + ribbon over the tie point
      if (stemGrow > 0.45) {
        drawBouquetWrap(f, tieX, tieY, p.constrain((stemGrow - 0.45) / 0.55, 0, 1));
      }

      // 3) Flowers, back (top) to front (bottom)
      const ordered = [...BOUQUET_LAYOUT].sort((a, b) => a.dy - b.dy);
      for (const a of ordered) {
        const fb = p.constrain((flowerBloom - a.delay) / (1 - a.delay), 0, 1);
        if (fb < 0.01) continue;
        buf.push();
        buf.translate(clusterCX + a.dx, clusterCY + a.dy);
        buf.scale(a.s);
        buf.translate(-BUF_W / 2, -BUF_H * 0.38);
        drawPeony3D(buf, f, fb, wl, BUF_W / 2, BUF_H * 0.38);
        buf.pop();
      }
    }

    function drawBouquetStem(
      f: FlowerPreset, x1: number, y1: number, x2: number, y2: number, grow: number, wl: number
    ) {
      let r = f.stemC[0], gc = f.stemC[1], b = f.stemC[2];
      if (wl > 0) {
        r  = p.lerp(r,  r  * 0.4 + 30, wl * 0.5);
        gc = p.lerp(gc, gc * 0.3 + 15, wl * 0.5);
        b  = p.lerp(b,  b  * 0.25 + 8, wl * 0.5);
      }
      const segs = 26;
      const bend = (x1 - x2) * 0.25;
      for (let i = 0; i <= segs; i++) {
        const tt = i / segs;
        if (tt > grow) break;
        // grow upward from the tie point toward the flower head
        const x = p.lerp(x2, x1, tt) + p.sin(tt * p.PI) * bend;
        const y = p.lerp(y2, y1, tt);
        const sw = p.lerp(8, 4, tt);
        buf.fill(r, gc, b);
        buf.ellipse(x, y, sw, sw);
        buf.fill(r * 1.4, gc * 1.4, b * 1.3, 60);
        buf.ellipse(x - 1.5, y, sw * 0.3, sw * 0.3);
      }
    }

    function drawBouquetWrap(f: FlowerPreset, x: number, y: number, a: number) {
      // A hand-tied wrapped bunch: kraft paper gathered at the tie, flaring
      // OUTWARD and UP around the stems, with a short tail below, tied off with
      // rustic twine. Reads as a wrapped pack rather than a vase/cone.
      const flareH = 150 * a;   // paper rising up around the bunch
      const tailH  = 48 * a;    // short paper tail beneath the tie
      const topW   = 210 * a;   // wide gathered opening at the top
      const tieW   = 26;        // pinched waist at the tie
      const botW   = 72 * a;    // slight flare at the bottom tail
      buf.push();
      buf.noStroke();

      // main kraft paper body (hourglass: wide top, pinched tie, small tail)
      buf.fill(190, 166, 132, 240);
      buf.beginShape();
      buf.vertex(x - topW / 2, y - flareH);
      buf.vertex(x + topW / 2, y - flareH);
      buf.vertex(x + tieW / 2, y + 2);
      buf.vertex(x + botW / 2, y + tailH);
      buf.vertex(x - botW / 2, y + tailH);
      buf.vertex(x - tieW / 2, y + 2);
      buf.endShape(p.CLOSE);

      // left highlighted fold panel
      buf.fill(218, 196, 164, 150);
      buf.beginShape();
      buf.vertex(x - topW / 2, y - flareH);
      buf.vertex(x - topW * 0.14, y - flareH);
      buf.vertex(x - tieW / 2, y);
      buf.endShape(p.CLOSE);

      // right shadowed fold panel
      buf.fill(150, 126, 96, 145);
      buf.beginShape();
      buf.vertex(x + topW / 2, y - flareH);
      buf.vertex(x + topW * 0.14, y - flareH);
      buf.vertex(x + tieW / 2, y);
      buf.endShape(p.CLOSE);

      // crease lines fanning from the tie up to the paper's top edge
      buf.stroke(150, 126, 96, 110);
      buf.strokeWeight(1.2);
      for (let i = -2; i <= 2; i++) {
        buf.line(x, y, x + (topW / 2) * (i / 2.4), y - flareH);
      }

      // twine tie: a couple of wound bands at the pinched waist
      buf.stroke(122, 96, 62, 235);
      buf.strokeWeight(3.5);
      buf.line(x - tieW * 1.05, y - 2, x + tieW * 1.05, y + 2);
      buf.strokeWeight(2.4);
      buf.line(x - tieW * 1.0, y + 4, x + tieW * 1.0, y + 8);
      // twine tails hanging from the knot
      buf.strokeWeight(1.8);
      buf.noFill();
      buf.bezier(x + 4, y + 4, x + tieW * 0.7, y + 16, x + tieW * 0.4, y + 26, x + tieW * 1.1, y + 34);
      buf.bezier(x + 4, y + 4, x + tieW * 0.9, y + 14, x + tieW * 1.3, y + 22, x + tieW * 0.8, y + 36);
      buf.noStroke();
      buf.pop();
    }

    function drawStem(g: p5.Graphics, f: FlowerPreset, progress: number, wl: number, cx: number, cy: number) {
      const focal   = 420;
      const stemLen = BUF_H * 0.42;
      const stemTop = cy;
      const stemBot = stemTop + stemLen;
      const visibleLen = stemLen * easeOutQuart(progress);
      const visibleTop = stemBot - visibleLen;

      // Project a point on the stem (given as an offset from the flower-head
      // pivot) through the same rot3D used for the petals, so the stem rotates
      // rigidly with the whole flower instead of staying anchored.
      const project = (offX: number, offY: number) => {
        const [rx, ry, rz] = rot3D(offX, offY, 0);
        const ps = focal / (focal + rz);
        return { sx: cx + rx * ps, sy: cy + ry * ps, ps };
      };

      for (let y = visibleTop; y < stemBot; y += 3) {
        const tt       = (y - stemTop) / stemLen;
        const sw       = p.lerp(15, 8, tt);
        const wiltBend = wl * 45 * (1 - tt) * p.sin((1 - tt) * p.PI);
        const curveX   = p.sin(tt * p.PI * 0.3) * 22 + p.sin(tt * p.PI * 0.8) * 8 + wiltBend;
        const { sx, sy, ps } = project(curveX, y - cy);
        let r  = p.lerp(f.stemC[0], f.stemC[0] * 0.5, tt);
        let gc = p.lerp(f.stemC[1], f.stemC[1] * 0.5, tt);
        let b  = p.lerp(f.stemC[2], f.stemC[2] * 0.5, tt);
        if (wl > 0) {
          r  = p.lerp(r,  r  * 0.4 + 30, wl * 0.5);
          gc = p.lerp(gc, gc * 0.3 + 15, wl * 0.5);
          b  = p.lerp(b,  b  * 0.25 + 8, wl * 0.5);
        }
        g.fill(r, gc, b);
        g.ellipse(sx, sy, sw * ps, 5 * ps);
        g.fill(r * 1.4, gc * 1.4, b * 1.3, 50);
        g.ellipse(sx - 2 * ps, sy, sw * 0.2 * ps, 3 * ps);
      }
      const placeLeaf = (frac: number, side: number, size: number) => {
        const ly = stemLen * frac;
        const lx = p.sin(frac * p.PI * 0.3) * 22;
        const { sx, sy, ps } = project(lx, ly);
        drawLeaf(g, sx, sy, side, size * ps, f.stemC);
      };
      if (progress > 0.3) {
        placeLeaf(0.22, -1, 48 * p.constrain((progress - 0.3) / 0.4, 0, 1));
      }
      if (progress > 0.5) {
        placeLeaf(0.50, 1, 42 * p.constrain((progress - 0.5) / 0.4, 0, 1));
      }
      if (progress > 0.7) {
        placeLeaf(0.35, -1, 35 * p.constrain((progress - 0.7) / 0.3, 0, 1));
      }
    }

    function drawLeaf(g: p5.Graphics, x: number, y: number, side: number, sz: number, sc: [number,number,number]) {
      if (sz < 2) return;
      g.push(); g.translate(x, y); g.rotate(side * 0.65);
      g.fill(sc[0]*0.85, sc[1]*1.15, sc[2]*0.75);
      g.beginShape();
      g.vertex(0, 0);
      g.bezierVertex(sz*0.35*side, -sz*0.38, sz*0.85*side, -sz*0.22, sz*1.35*side, 0);
      g.bezierVertex(sz*0.85*side,  sz*0.22,  sz*0.35*side, sz*0.38, 0, 0);
      g.endShape(p.CLOSE);
      g.fill(sc[0]*1.1, sc[1]*1.4, sc[2]*1.0, 60);
      g.beginShape();
      g.vertex(sz*0.1*side, 0);
      g.bezierVertex(sz*0.4*side, -sz*0.15, sz*0.7*side, -sz*0.08, sz*1.0*side, 0);
      g.bezierVertex(sz*0.7*side,  sz*0.08,  sz*0.4*side, sz*0.15,  sz*0.1*side, 0);
      g.endShape(p.CLOSE);
      g.stroke(sc[0]*1.3, sc[1]*1.5, sc[2]*1.2, 70);
      g.strokeWeight(0.8);
      g.line(0, 0, sz*1.15*side, 0);
      for (let i = 1; i <= 3; i++) {
        const vx = sz * 0.3 * i * side;
        g.line(vx, 0, vx + sz*0.2*side, -sz*0.12);
        g.line(vx, 0, vx + sz*0.2*side,  sz*0.12);
      }
      g.noStroke(); g.pop();
    }

    function rot3D(x: number, y: number, z: number) {
      const cY = p.cos(rotY), sY = p.sin(rotY);
      const rx  = x*cY + z*sY;
      const rz  = -x*sY + z*cY;
      const cX  = p.cos(rotX), sX = p.sin(rotX);
      const ry  = y*cX - rz*sX;
      const rz2 = y*sX + rz*cX;
      const cZ  = p.cos(rotZ), sZ = p.sin(rotZ);
      const fx  = rx*cZ - ry*sZ;
      const fy  = rx*sZ + ry*cZ;
      return [fx, fy, rz2];
    }

    function drawPeony3D(g: p5.Graphics, f: FlowerPreset, bl: number, wl: number, cx: number, cy: number) {
      const focal    = 420;
      const wiltTilt = wl * 0.18;
      const cosW = p.cos(wiltTilt), sinW = p.sin(wiltTilt);
      const items: any[] = [];

      if (f.sepals && bl < 0.7) {
        const numS    = f.sepals;
        const openAng = easeInOutCubic(bl) * p.HALF_PI * 0.9;
        let sepalAlpha = p.map(p.constrain(bl, 0, 0.7), 0, 0.7, 255, 0);
        if (wl) sepalAlpha *= (1 - wl);
        if (sepalAlpha > 5) {
          for (let i = 0; i < numS; i++) {
            const a      = (p.TWO_PI / numS) * i;
            const sTilt  = p.HALF_PI * 0.35 - openAng;
            const dist   = 50;
            const ct = p.cos(sTilt), st = p.sin(sTilt);
            const x3 = p.cos(a)*dist*ct, z3 = p.sin(a)*dist*ct, y3 = -st*dist;
            const [rx, ry, rz] = rot3D(x3, y3, z3);
            const ps     = focal / (focal + rz);
            const sepAng = p.atan2(ry, rx);
            const fv     = p.max(focal / (focal + p.abs(rz)), 0.15);
            items.push({ rz, tp:'s', sx:rx*ps, sy:ry*ps, sa:sepAng,
              sLen:80*ps, sW:25*ps*fv, sAlpha:sepalAlpha, sc:f.stemC });
          }
        }
      }

      const cAlpha = p.constrain((bl - 0.45) / 0.3, 0, 1) * (1 - wl);
      if (cAlpha > 0) items.push({ rz:0, tp:'c', sx:0, sy:0, sa:0, alpha:cAlpha });

      for (let layer = f.layers; layer >= 0; layer--) {
        const lr         = layer / f.layers;
        const layerDelay = (1 - lr) * 0.35;
        const layerBl    = p.constrain((bl - layerDelay) / (1 - layerDelay), 0, 1);
        const ebl        = easeInOutCubic(layerBl);
        if (ebl < 0.01) continue;
        const layerFall = p.constrain((wl * 1.4 - (1 - lr) * 0.4) / 0.6, 0, 1);
        if (layerFall > 0.9) continue;
        const innerBoost = (1 - lr);
        const np         = f.petalsPerLayer + p.floor(layer * 1.5) + p.floor(innerBoost * 5);
        const baseR      = p.lerp(10, f.maxRadius, lr);
        let tiltAngle    = p.lerp(p.PI * 0.42, p.PI * 0.04, ebl) + layerFall * p.PI * 0.22;
        tiltAngle -= innerBoost * 0.15 * ebl;
        const cosTilt = p.cos(tiltAngle), sinTilt = p.sin(tiltAngle);

        for (let i = 0; i < np; i++) {
          const petalHash = ((i * 73 + layer * 137) & 0xFF) / 255;
          if (wl > 0.1 && petalHash < (wl - 0.1) * 1.3) continue;
          let angle = (p.TWO_PI / np) * i + layer * 0.42 + p.sin(layer * 2.1) * 0.12;
          angle += petalHash * 0.15;
          const droopAmt = layerFall * 0.5 * (0.4 + lr * 0.6);
          const shrink   = 1 - layerFall * 0.35;
          const dist     = baseR * ebl * (0.35 + lr * 0.25);
          let x3 = p.cos(angle)*dist*cosTilt, z3 = p.sin(angle)*dist*cosTilt, y3 = -sinTilt*dist + droopAmt*28;
          if (wiltTilt > 0.001) {
            const ny = y3*cosW - x3*sinW*0.3;
            x3 = x3 + y3*sinW*0.3; y3 = ny;
          }
          const [rx, ry, rz] = rot3D(x3, y3, z3);
          const ps         = focal / (focal + rz);
          const sx         = rx * ps, sy = ry * ps;
          const viewAngle  = p.atan2(ry, rx);
          const depthFactor = focal / (focal + p.abs(rz));
          const faceVis    = p.max(depthFactor, 0.12);
          const nx3 = p.cos(angle)*cosTilt, ny3 = -sinTilt, nz3 = p.sin(angle)*cosTilt;
          const [,,lnz] = rot3D(nx3, ny3, nz3);
          const lightDot = p.constrain(-lnz, -1, 1);
          const lightMod = p.map(lightDot, -1, 1, 0.32, 1.25);
          const cupFactor = (1 - lr) * (1 - ebl * 0.5) * 0.35;
          const pl = baseR * (0.2 + 0.8*ebl) * (1.15 + innerBoost*0.3) * shrink * ps;
          let pw = baseR * (0.15 + 0.85*ebl) * 0.55 * shrink * ps * faceVis;
          pw *= (1 + cupFactor);
          const rPhase = i*1.7 + layer*0.9;
          const rAmt   = f.ruffleAmt * ebl * (1 + layerFall*2 + innerBoost*0.5) * ps;
          const lA     = p.sin(angle + layer*0.5);
          const dM     = p.map(layer, 0, f.layers, 0.35, 1.0);
          const bB     = 0.4 + 0.6*ebl;
          const cm     = p.map(lA, -1, 1, 0.45, 1.2) * dM * bB * lightMod;
          let r  = p.constrain(p.lerp(f.c1[0], f.c2[0], lr) * cm, 0, 255);
          let gr = p.constrain(p.lerp(f.c1[1], f.c2[1], lr) * cm, 0, 255);
          let b  = p.constrain(p.lerp(f.c1[2], f.c2[2], lr) * cm, 0, 255);
          if (wl > 0) {
            const wf = p.min(1, layerFall * 1.3);
            r  = p.lerp(r,  r  * 0.5 + 55, wf);
            gr = p.lerp(gr, gr * 0.28 + 22, wf);
            b  = p.lerp(b,  b  * 0.12 + 6,  wf);
          }
          items.push({ rz, tp:'p', sx, sy, sa:viewAngle, pl, pw, rPhase, rAmt, r, gr, b, cup:cupFactor });
        }
      }

      items.sort((a, b) => a.rz - b.rz);

      for (const it of items) {
        if (it.tp === 'c') {
          g.push(); g.translate(cx, cy);
          const [cnx, cny, cnz] = rot3D(0, -1, 0);
          const cps = focal / (focal + cnz*15);
          const csx = cnx*15*cps, csy = cny*15*cps;
          for (let r = 28; r > 0; r -= 3) {
            const ratio = r / 28;
            g.fill(
              p.lerp(f.c3[0]*0.1, f.c3[0]*0.7, ratio) * (it.alpha||1),
              p.lerp(f.c3[1]*0.1, f.c3[1]*0.7, ratio) * (it.alpha||1),
              p.lerp(f.c3[2]*0.1, f.c3[2]*0.7, ratio) * (it.alpha||1)
            );
            g.ellipse(csx, csy, r*2.2*cps, r*2.2*cps);
          }
          if (bl > 0.65) {
            const sa2 = p.constrain((bl - 0.65) / 0.25, 0, 1) * (1 - wl);
            for (let i = 0; i < 22; i++) {
              const a   = (p.TWO_PI / 22) * i;
              const d   = 6 + (i % 5) * 3;
              const stX = p.cos(a)*d*sa2, stZ = p.sin(a)*d*sa2, stY = -3;
              const [srx, sry, srz] = rot3D(stX, stY, stZ);
              const stP = focal / (focal + srz);
              g.fill(f.c2[0]*0.7, f.c2[1]*0.5, f.c2[2]*0.3, 140*sa2);
              g.ellipse(srx*stP, sry*stP, 2.5*stP, 2.5*stP);
            }
          }
          g.pop();

        } else if (it.tp === 's') {
          if (!it.sW || it.sW < 1) continue;
          g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa);
          g.fill(it.sc[0]*0.7, it.sc[1]*1.0, it.sc[2]*0.6, it.sAlpha);
          g.beginShape();
          g.vertex(0, 0);
          g.bezierVertex(it.sLen*0.3, -it.sW*0.6, it.sLen*0.7, -it.sW*0.4, it.sLen, 0);
          g.bezierVertex(it.sLen*0.7,  it.sW*0.4,  it.sLen*0.3,  it.sW*0.6, 0, 0);
          g.endShape(p.CLOSE);
          g.pop();

        } else {
          if (!it.pw || it.pw < 0.5) continue;
          g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa);
          g.fill(it.r, it.gr, it.b);
          g.beginShape();
          for (let tt = 0; tt <= 1; tt += 0.07) {
            const px  = tt * it.pl;
            const bW  = p.sin(tt * p.PI) * it.pw;
            const cup = p.sin(tt * p.PI) * (it.cup||0) * it.pw * 0.6;
            const ruf = p.sin(tt*8 + it.rPhase) * it.rAmt * tt;
            g.vertex(px, bW + ruf + cup);
          }
          for (let tt = 1; tt >= 0; tt -= 0.07) {
            const px  = tt * it.pl;
            const bW  = p.sin(tt * p.PI) * it.pw;
            const cup = p.sin(tt * p.PI) * (it.cup||0) * it.pw * 0.4;
            const ruf = p.sin(tt*8 + it.rPhase + p.PI) * it.rAmt * tt;
            g.vertex(px, -bW + ruf - cup);
          }
          g.endShape(p.CLOSE);
          g.pop();
        }
      }
    }

    function renderToScreen() {
      const params = getParams();
      const px      = buf.pixels;
      const g_val   = p.max(4, p.round(grid));
      const asciiG  = p.max(g_val, 6);
      const scaleF  = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
      const invScale = 1 / scaleF;
      const renderW = BUF_W * scaleF, renderH = BUF_H * scaleF;
      const ox = (p.width  - renderW) / 2 + mInfX;
      const oy = (p.height - renderH) / 2 + mInfY;

      if (params.forcedRenderMode === 'raw') {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage((buf as any).canvas as HTMLCanvasElement, ox, oy, renderW, renderH);
        return;
      }

      let curM = renderMode;
      let prevM = prevMode;
      
      if (params.forcedRenderMode !== 'auto') {
        if (params.forcedRenderMode === 'ascii') curM = 0;
        if (params.forcedRenderMode === 'dots') curM = 1;
        if (params.forcedRenderMode === 'pixels') curM = 2;
        prevM = curM;
      }

      const mt = modeT;
      const transitionDone = mt >= 0.99;
      const useNative    = (curM === 0) || (!transitionDone && prevM === 0);
      if (useNative) { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
      
      const gEff  = (curM === 0 && transitionDone) ? asciiG : g_val;
      const stepX = p.max(1, p.floor(gEff * invScale));
      const stepY = p.max(1, p.floor(gEff * invScale));
      const gDraw = gEff;

      const drawASCII = (r:number, gr:number, b:number, a:number, rx:number, ry:number) => {
        const br = (r*0.299 + gr*0.587 + b*0.114) / 255;
        const ci = p.floor(p.map(br, 0, 1, 0, chars.length - 1));
        const ch = chars[p.constrain(ci, 0, chars.length - 1)];
        ctx.fillStyle = `rgba(${r},${gr},${b},${a/255})`;
        ctx.font = `${p.floor(gDraw * 1.4)}px Courier New`;
        ctx.fillText(ch, rx + gDraw/2, ry + gDraw/2);
      };
      const drawDots = (r:number, gr:number, b:number, a:number, rx:number, ry:number) => {
        const br = (r*0.299 + gr*0.587 + b*0.114) / 255;
        const rad = (gDraw * 0.9) * br;
        if (rad < 0.5) return;
        ctx.fillStyle = `rgba(${r},${gr},${b},${a/255})`;
        ctx.beginPath(); ctx.arc(rx + gDraw/2, ry + gDraw/2, rad/2, 0, p.TWO_PI); ctx.fill();
      };
      const drawPixels = (r:number, gr:number, b:number, a:number, rx:number, ry:number) => {
        ctx.fillStyle = `rgba(${r},${gr},${b},${a/255})`;
        ctx.fillRect(rx, ry, gDraw, gDraw);
      };

      for (let y = 0; y < BUF_H; y += stepY) {
        for (let x = 0; x < BUF_W; x += stepX) {
          const idx = (y * BUF_W + x) * 4;
          const r = px[idx], gr = px[idx+1], b = px[idx+2], a = px[idx+3];
          if (a < 10 && (r+gr+b) < 10) continue;
          const rx = ox + x * scaleF;
          const ry = oy + y * scaleF;

          if (transitionDone || prevM === curM) {
            if (curM === 0) drawASCII(r, gr, b, a, rx, ry);
            else if (curM === 1) drawDots(r, gr, b, a, rx, ry);
            else drawPixels(r, gr, b, a, rx, ry);
          } else {
            ctx.globalAlpha = 1 - mt;
            if (prevM === 0) drawASCII(r, gr, b, a, rx, ry);
            else if (prevM === 1) drawDots(r, gr, b, a, rx, ry);
            else drawPixels(r, gr, b, a, rx, ry);

            ctx.globalAlpha = mt;
            if (curM === 0) drawASCII(r, gr, b, a, rx, ry);
            else if (curM === 1) drawDots(r, gr, b, a, rx, ry);
            else drawPixels(r, gr, b, a, rx, ry);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
  };
}
