const FILTER_PRESETS = {
  clear: {},
  bassboost: {
    equalizer: [
      { band: 0, gain: 0.6 }, { band: 1, gain: 0.7 }, { band: 2, gain: 0.5 },
      { band: 3, gain: 0.25 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.25 },
    ],
  },
  heavybass: {
    equalizer: [
      { band: 0, gain: 1.0 }, { band: 1, gain: 0.9 }, { band: 2, gain: 0.7 },
      { band: 3, gain: 0.5 }, { band: 4, gain: 0.1 }, { band: 5, gain: -0.3 },
    ],
  },
  nightcore: { timescale: { speed: 1.2, pitch: 1.3, rate: 1.0 } },
  vaporwave: { timescale: { speed: 0.8, pitch: 0.8, rate: 1.0 } },
  "8d": { rotation: { rotationHz: 0.2 } },
  treble: {
    equalizer: [
      { band: 8, gain: 0.5 }, { band: 9, gain: 0.5 }, { band: 10, gain: 0.5 },
    ],
  },
  karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
  vibrato: { vibrato: { frequency: 4.0, depth: 0.75 } },
  tremolo: { tremolo: { frequency: 2.0, depth: 0.5 } },
  "soft": {
    equalizer: [
      { band: 0, gain: -0.3 }, { band: 1, gain: -0.3 }, { band: 14, gain: 0.3 },
    ],
    lowPass: { smoothing: 20 },
  },
};

const FILTER_NAMES = Object.keys(FILTER_PRESETS).filter(k => k !== "clear");

function mergeFilters(filterNames) {
  const merged = { equalizer: [] };
  for (const name of filterNames) {
    const preset = FILTER_PRESETS[name];
    if (!preset) continue;
    for (const [key, val] of Object.entries(preset)) {
      if (key === "equalizer" && Array.isArray(val)) {
        for (const band of val) {
          const existing = merged.equalizer.find(b => b.band === band.band);
          if (existing) existing.gain = Math.min(1.0, existing.gain + band.gain);
          else merged.equalizer.push({ ...band });
        }
      } else {
        merged[key] = val;
      }
    }
  }
  if (merged.equalizer.length === 0) delete merged.equalizer;
  return merged;
}

async function applyFilters(player, filterNames) {
  const filters = mergeFilters(filterNames);
  await player.shoukaku.setFilters(filters);
}

module.exports = { FILTER_PRESETS, FILTER_NAMES, mergeFilters, applyFilters };
