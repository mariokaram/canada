import fetch from "node-fetch";
import express from "express";
import moment from "moment";

const app = express();

app.use("/", async (req, res, next) => {
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
