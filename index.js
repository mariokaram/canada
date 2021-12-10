import fetch from "node-fetch";
import express from "express";
import moment from "moment";
import webpush from "web-push";
import bodyParser from "body-parser";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const storage = require("node-persist");
const isEmpty = require("lodash");
const isEqual = require("lodash");

const app = express();
let __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "views")));
app.use(bodyParser.json());

const fetchTime = async () => {
  try {
    const response = await fetch(
      "https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json"
    );
    const data = await response.json();
    let res = data["visitor-outside-canada"]["LB"];
    return res;
  } catch (error) {
    return "please refresh  :(";
  }
};

const publicVapidKey =
  "BInQfuPMAZD-MpQrIiz9jVsUYmKZeCd8H_nR3z6jux4G8Mo8pPEku3AiGYqTzGcAA48iCLrgREUseKexg20Osf4";
const privateVapidKey = "Zr2KunDpEph9JOias5aaoIHgu3ge4siZgRu-VGb8QpU";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

//subscribe route
app.post("/subscribe", async (req, res) => {
  //get push subscription object
  const subscription = req.body;

  //send status 201
  res.status(201).json({});

  //create paylod
  const payload = JSON.stringify({
    title: "Tourist Visa Updated Today",
    days: await fetchTime(),
  });

  await storage.init();

  const subObject = await storage.getItem("subscriptions");
  let subArray = [];

  if (isEmpty(subObject)) {
    subArray.push(subscription);
  }

  subArray.map(async (value) => {
    if (!isEqual(subscription, value)) {
      subArray.push(subscription);
    }
  });

  await storage.setItem("subscriptions", subArray);

  //pass the object into sendNotification
  if (moment().isoWeekday() == 5) {
    // console.log("hey");
    let allSub = await storage.getItem("subscriptions");
    console.log(allSub);
    allSub.map((value) => {
      webpush
        .sendNotification(value, payload)
        .catch((err) => console.error(err));
    });
  }
});

app.use("/", async (req, res, next) => {
  const dayINeed = 2; // for tuesday
  const today = moment().isoWeekday();
  let date;

  // if we haven't yet passed the day of the week that I need:
  if (today < dayINeed) {
    // then just give me this week's instance of that day
    date = moment().isoWeekday(dayINeed).format("DD/MM/YYYY");
  } else {
    // otherwise, give me next week's instance of that same day
    date = moment().add(1, "weeks").isoWeekday(dayINeed).format("DD/MM/YYYY");
  }
  let remainingDays = Math.ceil(
    moment(date, "DD/MM/YYYY").diff(moment(), "days", true)
  );

  res.render("index.pug", {
    data: await fetchTime(),
    update: date,
    remainingDays,
  });
});

app.listen(process.env.PORT || 8000, () => {
  console.log("App listening on port 8000");
});
