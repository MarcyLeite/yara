import { InfluxDB, Point } from "@influxdata/influxdb-client";
import axios from "axios";

const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET, DEV_DATE } = {
  INFLUX_ORG: "dev",
  INFLUX_BUCKET: "dev",
  INFLUX_TOKEN: "dev-token",
  INFLUX_URL: "http://influx-db:8086",
  DEV_DATE: "24 Dec 1997 12:00:00 GMT",
};

const getWriteApi = () =>
  new Promise((resolve) => {
    const influxDB = new InfluxDB({
      url: INFLUX_URL,
      token: INFLUX_TOKEN,
    });
    const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);

    const request = async () => {
      try {
        await axios.get(INFLUX_URL);
        resolve(writeApi);
      } catch {
        setTimeout(request, 1000);
      }
    };
    request();
  });

const populateDev = async () => {
  const now = Date.parse(DEV_DATE);
  const writeApi = await getWriteApi();

  const pointCount = 100;
  for (let i = 0; i < pointCount; i++) {
    const increase = i * 1000;
    const timestamp = now + increase;
    const datetime = new Date(timestamp);

    const pointA = new Point("A")
      .tag("source", "ME")
      .tag("status", "GOOD")
      .floatField("raw", i)
      .floatField("eng", i % 12)
      .timestamp(datetime);

    const pointB = new Point("B")
      .tag("source", "ME")
      .tag("status", "BAD")
      .floatField("raw", i)
      .floatField("eng", i + 1000)
      .timestamp(datetime);

    const pointC = new Point("C")
      .tag("source", "OTHER")
      .tag("status", i % 2 === 0 ? "GOOD" : "BAD")
      .floatField("raw", i * 4)
      .floatField("eng", i)
      .timestamp(datetime);

    const pointD = new Point("D")
      .tag("source", "OTHER")
      .tag("status", i % 2 === 0 ? "GOOD" : "BAD")
      .floatField("raw", i * 4)
      .stringField("eng", i % 2 === 0 ? "ON" : "OFF")
      .timestamp(datetime);

    const pointE = new Point("E")
      .tag("source", "OTHER")
      .tag("status", "GOOD")
      .timestamp(datetime);

    if (i % 2 === 0) {
      pointE.floatField("raw", i);
    } else {
      pointE.floatField("eng", i);
    }

    writeApi.writePoints([pointA, pointB, pointC, pointD, pointE]);
    await writeApi.flush();
    console.log(`Point added at: ${datetime}`);
  }
  console.log("Done!");
};

populateDev();
