import puzzleConfigs from "/app/game/puzzles.js";
import PuzzleShareEncoder from "/app/game/PuzzleShareEncoder.js";
import { runFunctionalTests } from "../TestHelpers.js";
import { mean } from "../../app/util/Array.js";
import { sort } from "../../app/util/sort.js";

const encoders = [{
  name: 'Raw',
  encode: PuzzleShareEncoder.encodeRaw,
  decode: PuzzleShareEncoder.decodeRaw,
}, {
  name: 'RunLength',
  encode: PuzzleShareEncoder.encodeRunLength,
  decode: PuzzleShareEncoder.decodeRunLength,
}, {
  name: 'RunLengthUndelimited',
  encode: PuzzleShareEncoder.encodeRunLengthUndelimited,
  decode: PuzzleShareEncoder.decodeRunLengthUndelimited,
}, {
  name: 'Raw + Base65',
  encode: (config) => PuzzleShareEncoder.base65Encode(PuzzleShareEncoder.encodeRaw(config)),
  decode: (base65String) => PuzzleShareEncoder.decodeRaw(PuzzleShareEncoder.base65Decode(base65String)),
// }, {
//   name: 'RunLength + Base65',
//   encode: (config) => PuzzleShareEncoder.base65Encode(PuzzleShareEncoder.encodeRunLength(config)),
//   decode: (base65String) => PuzzleShareEncoder.decodeRunLength(PuzzleShareEncoder.base65Decode(base65String)),
}, {
  name: 'RunLengthUndelimited + Base65',
  encode: (config) => PuzzleShareEncoder.base65Encode(PuzzleShareEncoder.encodeRunLengthUndelimited(config)),
  decode: (base65String) => PuzzleShareEncoder.decodeRunLengthUndelimited(PuzzleShareEncoder.base65Decode(base65String)),
}];

export function runPuzzleShareEncoderTests() {
  // manual_inspection_test_encoder(encoders[0]);
  // manual_inspection_test_benchmarkEncodingOptions();

  runFunctionalTests('PuzzleShareEncoder', [
    test_encodersRoundTrip
  ]);
}

function stripMetadata(puzzleConfig) {
  return { given: puzzleConfig.given };
}

function validateRoundTrip(encodeFn, decodeFn, puzzleConfig) {
  const original = stripMetadata(puzzleConfig);

  const encoded = encodeFn(original);
  const decoded = decodeFn(encoded);
  return {
    valid: JSON.stringify(decoded) === JSON.stringify(original),
    original,
    encoded,
    decoded,
  };
}

function manual_inspection_test_encoder(encoder) {
  for (const config of puzzleConfigs) {
    const original = stripMetadata(config);

    const encoded = encoder.encode(original);
    console.log(`Encoded string for ${encoder.name}/${config.title}`, original);
    console.log(`"${encoded}" (length: ${encoded.length})`);
    
    const decoded = encoder.decode(encoded);
    console.log("Decoded config is:", decoded);
    console.log('');
  }
}

function test_encodersRoundTrip() {
  for (const encoder of encoders) {
    const encodeFn = encoder.encode;
    const decodeFn = encoder.decode;

    for (const config of puzzleConfigs) {
      const result = validateRoundTrip(encodeFn, decodeFn, config);
      if (!result.valid) {
        console.error(`Round-trip validation failed for encoder: ${encoder.name}, config:`, config);
        console.error("Validation result:", result);
      }
    }
  }
}

function manual_inspection_test_benchmarkEncodingOptions() {
  const results = {};

  for (const encoder of encoders) {
    const lengths = [];

    const startTime = performance.now();
    for (const config of puzzleConfigs) {
      let encoded;
      try {
        encoded = encoder.encode(stripMetadata(config));
      } catch (error) {
        console.error(`Encoding failed for encoder: ${encoder.name}, config:`, config);
        console.error("Error:", error);
        continue;
      }

      try {
        encoder.decode(encoded);
      } catch (error) {
        console.error(`Decoding failed for encoder: ${encoder.name}, config:`, config);
        console.error("Error:", error);
        continue;
      }

      lengths.push(encoded.length);
    }
    const endTime = performance.now();
    const totalMillis = endTime - startTime;
    const averageEncodeDecodeTimeMillis = totalMillis / puzzleConfigs.length;

    lengths.sort(sort.numeric.ascending)
    const meanLength = mean(lengths);
    const median = lengths[Math.floor(lengths.length / 2)];
    const tenthPercentile = lengths[Math.floor(lengths.length * 0.1)];
    const ninetiethPercentile = lengths[Math.floor(lengths.length * 0.9)];

    results[encoder.name] = {
      mean: +meanLength.toFixed(1),
      '10th': tenthPercentile,
      median,
      '90th': ninetiethPercentile,
      ms: +averageEncodeDecodeTimeMillis.toFixed(3),
    };
  }

  console.log("Benchmark results for encoding options:", results);
}