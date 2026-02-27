// ignore_for_file: avoid_print
/// Generates WAV sound assets for Dentic.
///
/// Usage: dart run tool/generate_sounds.dart
library;

import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

const int sampleRate = 44100;
const int bitsPerSample = 16;
const int numChannels = 1;

void main() {
  final outDir = Directory('assets/sounds');
  if (!outDir.existsSync()) outDir.createSync(recursive: true);

  _generateZoneTransition('${outDir.path}/zone_transition.wav');
  _generateSessionComplete('${outDir.path}/session_complete.wav');

  print('Generated assets/sounds/zone_transition.wav');
  print('Generated assets/sounds/session_complete.wav');
}

/// Three-tone ascending chime: 660 Hz → 880 Hz → 1100 Hz, 350ms total.
/// Musical fifth intervals for a bright, noticeable alert.
void _generateZoneTransition(String path) {
  const durationMs = 350;
  final totalSamples = (sampleRate * durationMs / 1000).round();
  final thirdLen = totalSamples ~/ 3;
  final samples = Int16List(totalSamples);

  const freqs = [660.0, 880.0, 1100.0];
  const amplitude = 0.85;

  for (var i = 0; i < totalSamples; i++) {
    final noteIndex = i < thirdLen
        ? 0
        : i < thirdLen * 2
            ? 1
            : 2;
    final freq = freqs[noteIndex];
    final t = i / sampleRate;

    // Per-note envelope with crossfade overlap.
    final noteStart = noteIndex * thirdLen;
    final noteLen = noteIndex < 2 ? thirdLen : totalSamples - thirdLen * 2;
    final localI = i - noteStart;
    final envelope = _smoothEnvelope(localI, noteLen);

    // Fundamental + 2nd + 3rd harmonics for richer timbre.
    final fundamental = sin(2 * pi * freq * t) * amplitude;
    final h2 = sin(2 * pi * freq * 2 * t) * amplitude * 0.25;
    final h3 = sin(2 * pi * freq * 3 * t) * amplitude * 0.1;
    final value = (fundamental + h2 + h3) * envelope;
    samples[i] = (value * 32767).round().clamp(-32768, 32767);
  }

  _writeWav(path, samples);
}

/// C5-E5-G5-C6 arpeggio (523→659→784→1047 Hz), 1200ms total.
/// Lower octave for more presence, longer sustain with overlapping decay.
void _generateSessionComplete(String path) {
  const durationMs = 1200;
  final totalSamples = (sampleRate * durationMs / 1000).round();
  final noteLen = totalSamples ~/ 4;
  final samples = Float64List(totalSamples); // accumulate as double first
  const amplitude = 0.8;

  const freqs = [523.0, 659.0, 784.0, 1047.0]; // C5, E5, G5, C6

  // Each note starts at its onset and decays beyond its slice,
  // creating an overlapping reverb-like tail.
  for (var noteIdx = 0; noteIdx < freqs.length; noteIdx++) {
    final freq = freqs[noteIdx];
    final onset = noteIdx * noteLen;
    // Allow each note to ring for 2x its slice (or until end).
    final ringLen = min(noteLen * 2, totalSamples - onset);

    for (var j = 0; j < ringLen; j++) {
      final i = onset + j;
      if (i >= totalSamples) break;
      final t = i / sampleRate;
      final env = _sustainEnvelope(j, ringLen);

      final fundamental = sin(2 * pi * freq * t) * amplitude;
      final h2 = sin(2 * pi * freq * 2 * t) * amplitude * 0.2;
      final h3 = sin(2 * pi * freq * 3 * t) * amplitude * 0.08;
      samples[i] += (fundamental + h2 + h3) * env;
    }
  }

  // Convert to Int16, with clipping.
  final int16Samples = Int16List(totalSamples);
  for (var i = 0; i < totalSamples; i++) {
    int16Samples[i] = (samples[i] * 32767).round().clamp(-32768, 32767);
  }

  _writeWav(path, int16Samples);
}

/// Smooth attack-sustain-release envelope with cosine fade.
double _smoothEnvelope(int sampleIndex, int totalLen) {
  final pos = sampleIndex / totalLen;
  const attackEnd = 0.08;
  const releaseStart = 0.65;
  if (pos < attackEnd) {
    // Cosine fade-in for smooth onset.
    return 0.5 * (1 - cos(pi * pos / attackEnd));
  }
  if (pos > releaseStart) {
    // Cosine fade-out.
    final releasePos = (pos - releaseStart) / (1.0 - releaseStart);
    return 0.5 * (1 + cos(pi * releasePos));
  }
  return 1.0;
}

/// Longer sustain envelope for triumphant arpeggio notes.
double _sustainEnvelope(int sampleIndex, int totalLen) {
  final pos = sampleIndex / totalLen;
  const attackEnd = 0.05;
  const sustainEnd = 0.5;
  if (pos < attackEnd) {
    return 0.5 * (1 - cos(pi * pos / attackEnd));
  }
  if (pos < sustainEnd) {
    return 1.0;
  }
  // Gentle exponential-like release.
  final releasePos = (pos - sustainEnd) / (1.0 - sustainEnd);
  return (1.0 - releasePos) * (1.0 - releasePos);
}

/// Writes 16-bit mono PCM WAV file.
void _writeWav(String path, Int16List samples) {
  final dataSize = samples.length * 2;
  final fileSize = 36 + dataSize;

  final buffer = ByteData(44 + dataSize);
  var offset = 0;

  // RIFF header
  buffer.setUint8(offset++, 0x52); // R
  buffer.setUint8(offset++, 0x49); // I
  buffer.setUint8(offset++, 0x46); // F
  buffer.setUint8(offset++, 0x46); // F
  buffer.setUint32(offset, fileSize, Endian.little);
  offset += 4;
  buffer.setUint8(offset++, 0x57); // W
  buffer.setUint8(offset++, 0x41); // A
  buffer.setUint8(offset++, 0x56); // V
  buffer.setUint8(offset++, 0x45); // E

  // fmt sub-chunk
  buffer.setUint8(offset++, 0x66); // f
  buffer.setUint8(offset++, 0x6D); // m
  buffer.setUint8(offset++, 0x74); // t
  buffer.setUint8(offset++, 0x20); // (space)
  buffer.setUint32(offset, 16, Endian.little); // sub-chunk size
  offset += 4;
  buffer.setUint16(offset, 1, Endian.little); // PCM format
  offset += 2;
  buffer.setUint16(offset, numChannels, Endian.little);
  offset += 2;
  buffer.setUint32(offset, sampleRate, Endian.little);
  offset += 4;
  buffer.setUint32(
      offset, sampleRate * numChannels * bitsPerSample ~/ 8, Endian.little);
  offset += 4;
  buffer.setUint16(offset, numChannels * bitsPerSample ~/ 8, Endian.little);
  offset += 2;
  buffer.setUint16(offset, bitsPerSample, Endian.little);
  offset += 2;

  // data sub-chunk
  buffer.setUint8(offset++, 0x64); // d
  buffer.setUint8(offset++, 0x61); // a
  buffer.setUint8(offset++, 0x74); // t
  buffer.setUint8(offset++, 0x61); // a
  buffer.setUint32(offset, dataSize, Endian.little);
  offset += 4;

  for (final sample in samples) {
    buffer.setInt16(offset, sample, Endian.little);
    offset += 2;
  }

  File(path).writeAsBytesSync(buffer.buffer.asUint8List());
}
