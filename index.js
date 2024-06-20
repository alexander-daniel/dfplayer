const COMMAND = {
  NEXT: 0x01,
  PREVIOUS: 0x02,
  SET_TRACK: 0x03,
  INCREASE_VOLUME: 0x04,
  DECREASE_VOLUME: 0x05,
  SET_VOLUME: 0x06,
  SET_EQ: 0x07,
  SET_MODE: 0x08,
  SET_SOURCE: 0x09,
  STANDBY: 0x0a,
  RESUME: 0x0b,
  RESET: 0x0c,
  PLAY: 0x0d,
  PAUSE: 0x0e,
  SET_FOLDER: 0x0f,
  REPEAT_PLAY: 0x11,
  SET_GAIN: 0x10,
  QUERY_STATUS: 0x42,
  QUERY_VOLUME: 0x43,
  QUERY_EQ: 0x44,
  QUERY_MODE: 0x45,
  QUERY_SOFTWARE_VERSION: 0x46,
  QUERY_TOTAL_FILES_ON_TF_CARD: 0x47,
  QUERY_CURRENT_TRACK_ON_TF_CARD: 0x4b,
  QUERY_TOTAL_FILES_ON_UDISK: 0x4c,
  QUERY_CURRENT_TRACK_ON_UDISK: 0x4f,
  QUERY_TOTAL_FILES_ON_FLASH: 0x48,
  QUERY_CURRENT_TRACK_ON_FLASH: 0x4d,
};

const utils = {
  // get the high byte of a number
  getHighByte: function (checksum) {
    return checksum >> 8;
  },

  // get the low byte of a number
  // e.g. 0x1234 -> 0x34
  getLowByte: function (checksum) {
    return checksum & 0xff;
  },
};

const START_BYTE = 0x7e;
const END_BYTE = 0xef;
const VERSION_BYTE = 0xff;
const DATA_LENGTH = 0x06;
const REQUEST_ACK = 0x01;

class DFPlayer {
  constructor(spi) {
    this.uart = spi;
  }

  parseByte(byte) {
    const value = parseInt(byte, 16);
    return byte + " (" + value + ")";
  }

  calculateChecksum(command, p1, p2) {
    return -(VERSION_BYTE + DATA_LENGTH + command + REQUEST_ACK + p1 + p2);
  }

  sendCommand(command, p1 = 0, p2 = 0) {
    const checksum = this.calculateChecksum(command, p1, p2);
    const payload = new Uint8Array([
      START_BYTE,
      VERSION_BYTE,
      DATA_LENGTH,
      command,
      REQUEST_ACK,
      p1,
      p2,
      utils.getHighByte(checksum),
      utils.getLowByte(checksum),
      END_BYTE,
    ]);

    // console.log("sending:", payload);
    this.uart.write(payload);
  }

  playNext() {
    this.sendCommand(COMMAND.NEXT);
  }

  playPrevious() {
    this.sendCommand(COMMAND.PREVIOUS);
  }

  increaseVolume() {
    this.sendCommand(COMMAND.INCREASE_VOLUME);
  }

  decreaseVolume() {
    this.sendCommand(COMMAND.DECREASE_VOLUME);
  }

  volume(volume) {
    if (typeof volume !== "undefined") {
      this.sendCommand(COMMAND.SET_VOLUME, volume);
    } else {
      this.sendCommand(COMMAND.QUERY_VOLUME);
    }
  }

  setVolume(volume) {
    this.sendCommand(COMMAND.SET_VOLUME, 0x00, volume);
  }

  eq(genre) {
    if (typeof genre !== "undefined") {
      this.sendCommand(COMMAND.SET_EQ, genre);
    } else {
      this.sendCommand(COMMAND.QUERY_EQ);
    }
  }

  mode(mode) {
    if (typeof mode !== "undefined") {
      this.sendCommand(COMMAND.SET_MODE, mode);
    } else {
      this.sendCommand(COMMAND.QUERY_MODE);
    }
  }

  setSource(source) {
    this.sendCommand(COMMAND.SET_SOURCE, source);
  }

  standby() {
    this.sendCommand(COMMAND.STANDBY);
  }

  resume() {
    this.sendCommand(COMMAND.RESUME);
  }

  reset() {
    this.sendCommand(COMMAND.RESET);
  }

  play(trackNumber) {
    if (typeof trackNumber !== "undefined") {
      this.sendCommand(COMMAND.SET_TRACK, trackNumber);
    } else {
      this.sendCommand(COMMAND.PLAY);
    }
  }

  pause() {
    this.sendCommand(COMMAND.PAUSE);
  }

  setPlaybackFolder(folder, file) {
    // this is a bit confusing, the folder is 1-10, but the command is 0-9
    // const f = Math.max(1, Math.min(10, folder));
    this.sendCommand(COMMAND.SET_FOLDER, folder, file);
  }

  setGain(gain) {
    const g = Math.max(0, Math.min(31, gain));
    console.log("gain", gain);
    this.sendCommand(COMMAND.SET_GAIN, 0x00, g);
  }

  setRepeat(repeat = false) {
    this.sendCommand(COMMAND.REPEAT_PLAY, Number(repeat));
  }

  getStatus() {
    this.sendCommand(COMMAND.QUERY_STATUS);
  }

  getSoftwareVersion() {
    this.sendCommand(COMMAND.QUERY_SOFTWARE_VERSION);
  }

  getTotalFilesOnTFCard() {
    this.sendCommand(COMMAND.QUERY_TOTAL_FILES_ON_TF_CARD);
  }

  getTotalFilesOnUDisk() {
    this.sendCommand(COMMAND.QUERY_TOTAL_FILES_ON_UDISK);
  }

  getTotalFilesOnFlash() {
    this.sendCommand(COMMAND.QUERY_TOTAL_FILES_ON_FLASH);
  }

  getCurrentTrackOnTFCard() {
    this.sendCommand(COMMAND.QUERY_CURRENT_TRACK_ON_TF_CARD);
  }

  getCurrentTrackOnUDisk() {
    this.sendCommand(COMMAND.QUERY_CURRENT_TRACK_ON_UDISK);
  }

  getCurrentTrackOnFlash() {
    this.sendCommand(COMMAND.QUERY_CURRENT_TRACK_ON_FLASH);
  }
}

module.exports = DFPlayer;
