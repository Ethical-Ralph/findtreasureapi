const { gotoUrl } = require("./game");

const nodePrefix = "";
const startEndpoint = "start";

const startGame = () => {
  gotoUrl(nodePrefix, startEndpoint);
};

startGame();
