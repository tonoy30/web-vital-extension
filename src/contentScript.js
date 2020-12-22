import { InfluxDB, Point } from "@influxdata/influxdb-client-browser";
import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";

const token =
	"ltiVjZtQ5EH96UY_74DoWE0yOYmuusTSXmLIxyvf3DVt5FbGwzBSO47T1rCdb2Dm33CInralzhUrKfo7imp25A==";
const org = "aquafresh41ml@yahoo.com";
const bucket = "performance";

const client = token
	? new InfluxDB({
			url: "https://westeurope-1.azure.cloud2.influxdata.com",
			token: token,
	  })
	: null;

const infoDiv = document.createElement("div");
infoDiv.style.position = "relative";
infoDiv.style.right = 0;
infoDiv.style.top = 0;
infoDiv.style.zIndex = 12;
infoDiv.style.backgroundColor = "black";
infoDiv.style.color = "white";
infoDiv.style.padding = "1rem";
infoDiv.style.fontFamily = "Arial";
document.body.appendChild(infoDiv);

const metrics = {};

const gatherMetrics = ({ name, value }) => {
	metrics[name] = value;
	if (client) {
		const writeApi = client.getWriteApi(org, bucket);
		writeApi.useDefaultTags({ host: "host1" });

		const point = new Point("perf").floatField(name, value);
		writeApi.writePoint(point);
		writeApi.close();
	}
	chrome.runtime.sendMessage({
		type: "performance:metric",
		name,
		value,
	});

	const metricsHTML = Object.keys(metrics)
		.map((k) => `<div>${k}</div><div>${Math.round(metrics[k])}</div>`)
		.join("");

	infoDiv.innerHTML = `
            <div style="font-weight:bold;font-size:x-large">Perf Metrics</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; grid-column-gap: 1rem;">
            <div>Metric</div>
            <div>Value</div>
            ${metricsHTML}
            </div>`;
};

getTTFB(gatherMetrics);
getLCP(gatherMetrics);
getFID(gatherMetrics);
getFCP(gatherMetrics);
getCLS(gatherMetrics);
