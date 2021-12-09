import fetch from "node-fetch";
import express from "express";

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

  res.render("index.pug", { data: await fetchTime() });
});

app.listen(process.env.PORT || 8000, () => {
  console.log("App listening on port 8000");
});
