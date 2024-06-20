const { UART } = require("uart");

const DFPlayer = require("./index");

const serial0 = new UART(0, {
  baudrate: 9600,
  bits: 8,
});

pinMode(25, OUTPUT);
digitalWrite(25, HIGH);

const player = new DFPlayer(serial0);
global.player = player;
console.log(player.getSoftwareVersion());
player.reset();
// player.setGain(1);
// player.play(0x0101);

let buffer = "";

serial0.on("data", function (data) {
  // console.log(data);
  buffer += data;
  while (buffer.length >= 10) {
    var packet = buffer
      .slice(0, 10)
      .split("")
      .map(function (x) {
        return (256 + x.charCodeAt(0)).toString(16).substr(-2).toUpperCase();
      });
    buffer = buffer.slice(10);
    console.log("Returned: 0x" + player.parseByte(packet[3]));
    console.log(
      "Parameter: 0x" +
        player.parseByte(packet[5]) +
        ", 0x" +
        player.parseByte(packet[6])
    );
  }
});
