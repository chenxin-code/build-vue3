<template>
  <div class="solar-system-container">
    <div class="stars"></div>
    <div class="solar-system">
      <div class="sun"></div>

      <div class="orbit mercury-orbit"><div class="planet mercury" title="水星"></div></div>
      <div class="orbit venus-orbit"><div class="planet venus" title="金星"></div></div>
      <div class="orbit earth-orbit">
        <div class="planet earth" title="地球"></div>
        <div class="moon-orbit"><div class="moon"></div></div>
      </div>
      <div class="orbit mars-orbit"><div class="planet mars" title="火星"></div></div>
      <div class="orbit jupiter-orbit"><div class="planet jupiter" title="木星"></div></div>
      <div class="orbit saturn-orbit">
        <div class="planet saturn" title="土星">
          <div class="saturn-ring"></div>
        </div>
      </div>
      <div class="orbit uranus-orbit"><div class="planet uranus" title="天王星"></div></div>
      <div class="orbit neptune-orbit"><div class="planet neptune" title="海王星"></div></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="less" scoped>
.solar-system-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 700px;
  background: radial-gradient(ellipse at center, #0a0a1a 0%, #000 100%);
  border-radius: 12px;
  margin: 20px;
  overflow: hidden;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1.5px 1.5px at 10% 15%, #fff, transparent),
    radial-gradient(1px 1px at 25% 35%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 40% 80%, #fff, transparent),
    radial-gradient(1px 1px at 55% 20%, #fff, transparent),
    radial-gradient(2px 2px at 70% 65%, #fff, transparent),
    radial-gradient(1px 1px at 85% 40%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 15% 70%, #fff, transparent),
    radial-gradient(1px 1px at 90% 85%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 50% 50%, #fff, transparent),
    radial-gradient(1px 1px at 30% 10%, #fff, transparent),
    radial-gradient(1px 1px at 65% 90%, #fff, transparent),
    radial-gradient(2px 2px at 80% 15%, #fff, transparent),
    radial-gradient(1px 1px at 5% 55%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 95% 30%, #fff, transparent),
    radial-gradient(1px 1px at 45% 45%, #fff, transparent);
  animation: twinkle 4s ease-in-out infinite alternate;
}

.solar-system {
  position: relative;
  width: 660px;
  height: 660px;
  z-index: 1;
}

.sun {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffbe6, #ffd700 30%, #ff8c00 65%, #ff4500);
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.9),
    0 0 80px rgba(255, 140, 0, 0.6),
    0 0 120px rgba(255, 69, 0, 0.3);
  transform: translate(-50%, -50%);
  animation: sun-pulse 3s ease-in-out infinite;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.planet {
  position: absolute;
  border-radius: 50%;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

/* Mercury */
.mercury-orbit {
  width: 90px;
  height: 90px;
  animation: orbit-rotate 5s linear infinite;
}
.mercury {
  width: 6px;
  height: 6px;
  background: radial-gradient(circle at 35% 35%, #d4d4d4, #8c8c8c);
  box-shadow: 0 0 4px rgba(200, 200, 200, 0.5);
}

/* Venus */
.venus-orbit {
  width: 130px;
  height: 130px;
  animation: orbit-rotate 8s linear infinite;
}
.venus {
  width: 10px;
  height: 10px;
  background: radial-gradient(circle at 35% 35%, #ffe4b5, #daa520);
  box-shadow: 0 0 8px rgba(218, 165, 32, 0.6);
}

/* Earth */
.earth-orbit {
  width: 180px;
  height: 180px;
  animation: orbit-rotate 12s linear infinite;
}
.earth {
  width: 11px;
  height: 11px;
  background: radial-gradient(circle at 35% 35%, #87ceeb, #1e90ff 40%, #228b22 70%);
  box-shadow: 0 0 10px rgba(30, 144, 255, 0.7);
}

.moon-orbit {
  position: absolute;
  top: -5px;
  left: 50%;
  width: 22px;
  height: 22px;
  transform: translateX(-50%);
  animation: orbit-rotate 2s linear infinite;
}

.moon {
  position: absolute;
  top: -2px;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #ccc;
  transform: translateX(-50%);
}

/* Mars */
.mars-orbit {
  width: 230px;
  height: 230px;
  animation: orbit-rotate 18s linear infinite;
}
.mars {
  width: 9px;
  height: 9px;
  background: radial-gradient(circle at 35% 35%, #ff7f50, #c1440e);
  box-shadow: 0 0 8px rgba(193, 68, 14, 0.6);
}

/* Jupiter */
.jupiter-orbit {
  width: 310px;
  height: 310px;
  animation: orbit-rotate 30s linear infinite;
}
.jupiter {
  width: 22px;
  height: 22px;
  background: radial-gradient(circle at 35% 35%, #faebd7, #daa06d 30%, #cd853f 55%, #8b7355 80%);
  box-shadow: 0 0 14px rgba(205, 133, 63, 0.5);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 45%;
    left: 0;
    width: 100%;
    height: 15%;
    background: rgba(139, 69, 19, 0.3);
    border-radius: 50%;
  }
}

/* Saturn */
.saturn-orbit {
  width: 400px;
  height: 400px;
  animation: orbit-rotate 45s linear infinite;
}
.saturn {
  width: 18px;
  height: 18px;
  background: radial-gradient(circle at 35% 35%, #f5deb3, #daa520 40%, #b8860b);
  box-shadow: 0 0 10px rgba(218, 165, 32, 0.5);
}
.saturn-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 34px;
  height: 34px;
  border: 3px solid rgba(210, 180, 140, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(75deg);
  box-shadow: inset 0 0 2px rgba(210, 180, 140, 0.3);
}

/* Uranus */
.uranus-orbit {
  width: 490px;
  height: 490px;
  animation: orbit-rotate 60s linear infinite;
}
.uranus {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 35% 35%, #e0ffff, #5f9ea0);
  box-shadow: 0 0 10px rgba(95, 158, 160, 0.6);
}

/* Neptune */
.neptune-orbit {
  width: 570px;
  height: 570px;
  animation: orbit-rotate 80s linear infinite;
}
.neptune {
  width: 13px;
  height: 13px;
  background: radial-gradient(circle at 35% 35%, #6495ed, #4169e1 50%, #0000cd);
  box-shadow: 0 0 12px rgba(65, 105, 225, 0.7);
}

@keyframes orbit-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes sun-pulse {
  0%, 100% {
    box-shadow:
      0 0 40px rgba(255, 215, 0, 0.9),
      0 0 80px rgba(255, 140, 0, 0.6),
      0 0 120px rgba(255, 69, 0, 0.3);
  }
  50% {
    box-shadow:
      0 0 60px rgba(255, 215, 0, 1),
      0 0 110px rgba(255, 140, 0, 0.8),
      0 0 160px rgba(255, 69, 0, 0.5);
  }
}

@keyframes twinkle {
  from { opacity: 0.4; }
  to   { opacity: 1; }
}
</style>
