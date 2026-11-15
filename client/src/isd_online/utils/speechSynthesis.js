/**
 * @file speechSynthesis.js
 * @description Web Speech API voice synthesis manager for the 3D AI Financial Advisor Orb.
 * Manages utterance queues, voice selection, mute toggling, and visual speech callbacks.
 */

class SpeechController {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isMuted = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.listeners = new Set();
  }

  /**
   * Register a listener for speaking state changes
   * @param {Function} callback (isSpeaking: boolean) => void
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(state) {
    this.isSpeaking = state;
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Speech callback error:', err);
      }
    });
  }

  /**
   * Speak a text string using synthesized speech
   * @param {string} text Plain text script to speak
   * @param {Object} options pitch, rate, volume
   */
  speak(text, { rate = 1.0, pitch = 1.05, volume = 1.0 } = {}) {
    if (!this.synth || this.isMuted || !text) {
      return;
    }

    // Cancel any in-flight utterance
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Pick a natural, crisp English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Karen')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => this.notify(true);
    utterance.onend = () => this.notify(false);
    utterance.onerror = () => this.notify(false);

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Stop speech immediately
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }
}

export const speechController = new SpeechController();
