const request = require("superagent");
const Queue = require("./Queue");
const decryptNtimes = require("./crypto");

const token = "";
const reqHeaders = {
  gomoney: "",
  Authorization: `Bearer ${token}`,
};

const waitTillReset = (resetTime) => {
  resetTime = new Date(resetTime * 1000) - new Date();
  return new Promise((res, rej) => setTimeout(res, resetTime));
};

const queue = new Queue();

let visted = [];

const saveUrl = (url) => {
  visted.push(url);
  visted = [...new Set(visted)];
  return visted;
};

const readUrl = () => visted;
let count = 0;

const gotoUrl = async (nodePrefix, endpoint) => {
  let url = `${nodePrefix}/${endpoint}`;
  if (readUrl().includes(url)) {
    return queue.length() > 0 ? queue.getNext()() : console.log("Done");
  }
  request
    .get(url)
    .set(reqHeaders)
    .redirects(0)
    .ok((res) => res.status < 400)
    .then(async (res) => {
      saveUrl(url);
      count++;
      const {
        headers,
        body: {
          paths,
          treasures,
          encryption: { key },
        },
      } = res;
      let rateLimitRemaining = headers["x-ratelimit-reset"];

      const prevNodes = readUrl();
      paths.forEach((path) => {
        let node = decryptNtimes(path.cipherId, key, key.slice(0, 16), path.n);
        queue.enQueue(() => gotoUrl(nodePrefix, node));
      });
      console.log(
        "-------------------------------------------------------------"
      );
      console.log(
        "Node Hit: ",
        count,
        ",",
        "x-ratelimit-remaining: ",
        headers["x-ratelimit-remaining"]
      );

      const queueLength = queue.length();
      console.log(
        "Treasure: ",
        JSON.stringify(treasures),
        "in Queue: ",
        queueLength
      );
      console.log(
        "-------------------------------------------------------------"
      );

      if (headers["x-ratelimit-remaining"] == 0) {
        console.log("waiting");
        await waitTillReset(rateLimitRemaining);
        console.log("waiting complete");
      }

      queueLength > 0 ? queue.getNext()() : console.log("done");
    })
    .catch((error) => {
      if (error.status == 302) {
        queue.length() > 0 && queue.getNext()();
      } else if (error.status == 429) {
        queue.enQueue(() => gotoUrl(url));
      } else if (error.status == 404) {
        queue.getNext()();
      } else if (error.status == 422) {
        queue.enQueue(() => gotoUrl(url));
      } else {
        // i should have tried the failed request again with
        // gotoUrl(nodePrefix, url);
        return queue.length() > 0 && queue.getNext()();
      }
    });
};

module.exports = {
  gotoUrl,
};
