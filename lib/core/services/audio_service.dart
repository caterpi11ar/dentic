import 'package:just_audio/just_audio.dart';

/// Manages sound effects for brushing sessions.
class AudioService {
  final AudioPlayer _transitionPlayer = AudioPlayer();
  final AudioPlayer _completePlayer = AudioPlayer();

  bool _initialized = false;

  /// Preloads WAV assets. Fails silently if assets are missing.
  Future<void> initialize() async {
    try {
      await _transitionPlayer
          .setAsset('assets/sounds/zone_transition.wav');
      await _completePlayer
          .setAsset('assets/sounds/session_complete.wav');
      _initialized = true;
    } catch (_) {
      // Graceful degradation — audio is optional.
    }
  }

  /// Plays the zone transition chime.
  Future<void> playZoneTransition() async {
    if (!_initialized) return;
    try {
      await _transitionPlayer.seek(Duration.zero);
      await _transitionPlayer.play();
    } catch (_) {}
  }

  /// Plays the session complete arpeggio.
  Future<void> playSessionComplete() async {
    if (!_initialized) return;
    try {
      await _completePlayer.seek(Duration.zero);
      await _completePlayer.play();
    } catch (_) {}
  }

  /// Releases audio player resources.
  Future<void> dispose() async {
    await _transitionPlayer.dispose();
    await _completePlayer.dispose();
  }
}
