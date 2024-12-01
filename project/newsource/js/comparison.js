const barMargin = { top: 20, right: 150, bottom: 50, left: 50 };
const barWidth = 600 - barMargin.left - barMargin.right;
const barHeight = 400 - barMargin.top - barMargin.bottom;

const tooltip = d3.select("#tooltip1");

// Load both CSV files for bar charts
Promise.all([
  d3.csv("malefemale34.csv"),
  d3.csv("malefemale64.csv"),
])
  .then(function ([data1, data2]) {
    [data1, data2].forEach((dataset) => {
      dataset.forEach((d) => {
        d.Female_Percentage = +d.Female_Percentage || 0;
        d.Male_Percentage = +d.Male_Percentage || 0;
      });
    });

    const drawChart = (data, svgId, year, educationLevel) => {
      const svg = d3
        .select(svgId)
        .attr(
          "viewBox",
          `0 0 ${barWidth + barMargin.left + barMargin.right} ${
            barHeight + barMargin.top + barMargin.bottom
          }`
        )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .html("") // Clear any existing content
        .append("g")
        .attr(
          "transform",
          `translate(${barMargin.left},${barMargin.top})`
        );

      const xScale = d3.scaleBand().range([0, barWidth]).padding(0.2);

      const yScale = d3.scaleLinear().range([barHeight, 0]);

      const colorScale = d3
        .scaleOrdinal()
        .domain(["Female_Percentage", "Male_Percentage"])
        .range(["#dc0ab4", "#0d88e6"]); // #dc0ab4 for Female, #0d88e6 for Male

      const xAxis = svg
        .append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${barHeight})`);

      const yAxis = svg.append("g").attr("class", "axis y-axis");

      const updateChart = (year, educationLevel) => {
        const filteredData = data.filter(
          (d) => d.Year == year && d.Education_Level == educationLevel
        );

        if (filteredData.length === 0) {
          svg.selectAll(".bar-group").remove();
          xAxis.call(d3.axisBottom(xScale).scale(xScale.domain([])));
          yAxis.call(d3.axisLeft(yScale));
          console.warn("No data available for the selected filters.");
          return;
        }

        xScale.domain(filteredData.map((d) => d.Region));
        yScale
          .domain([
            0,
            d3.max(filteredData, (d) =>
              Math.max(d.Female_Percentage, d.Male_Percentage)
            ),
          ])
          .nice();

        const bars = svg
          .selectAll(".bar-group")
          .data(filteredData)
          .join(
            (enter) => {
              const barGroup = enter
                .append("g")
                .attr("class", "bar-group")
                .attr(
                  "transform",
                  (d) => `translate(${xScale(d.Region)}, 0)`
                );

              barGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", barHeight)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", 0)
                .attr("fill", colorScale("Female_Percentage"))
                .on("mouseover", (event, d) => {
                  tooltip
                    .style("display", "block")
                    .html(
                      `Region: ${d.Region}<br>Female: ${(
                        d.Female_Percentage * 100
                      ).toFixed(1)}%`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`);
                })
                .on("mouseout", () => tooltip.style("display", "none"))
                .transition()
                .duration(1000)
                .attr("y", (d) => yScale(d.Female_Percentage))
                .attr(
                  "height",
                  (d) => barHeight - yScale(d.Female_Percentage)
                );

              barGroup
                .append("rect")
                .attr("x", xScale.bandwidth() / 2)
                .attr("y", barHeight)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", 0)
                .attr("fill", colorScale("Male_Percentage"))
                .on("mouseover", (event, d) => {
                  tooltip
                    .style("display", "block")
                    .html(
                      `Region: ${d.Region}<br>Male: ${(
                        d.Male_Percentage * 100
                      ).toFixed(1)}%`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`);
                })
                .on("mouseout", () => tooltip.style("display", "none"))
                .transition()
                .duration(1000)
                .attr("y", (d) => yScale(d.Male_Percentage))
                .attr(
                  "height",
                  (d) => barHeight - yScale(d.Male_Percentage)
                );
            },
            (update) => {
              update
                .select("rect")
                .transition()
                .duration(1000)
                .attr("y", (d) => yScale(d.Female_Percentage))
                .attr(
                  "height",
                  (d) => barHeight - yScale(d.Female_Percentage)
                );

              update
                .select("rect")
                .transition()
                .duration(1000)
                .attr("y", (d) => yScale(d.Male_Percentage))
                .attr(
                  "height",
                  (d) => barHeight - yScale(d.Male_Percentage)
                );
            }
          );

        xAxis
          .call(d3.axisBottom(xScale).tickSizeOuter(0))
          .selectAll("text")
          .attr("transform", "rotate(-40)")
          .style("text-anchor", "end");

        yAxis.call(d3.axisLeft(yScale).ticks(5));
      };

      updateChart(year, educationLevel);

      return updateChart;
    };

    const updateChart1 = drawChart(
      data1,
      "#chart1",
      "2016",
      "Bachelor's Educational Attainment"
    );
    const updateChart2 = drawChart(
      data2,
      "#chart2",
      "2016",
      "Bachelor's Educational Attainment"
    );

    d3.select("#year-select").on("change", function () {
      const selectedYear = this.value;
      const selectedEducationLevel = d3
        .select("#education-select")
        .property("value");
      updateChart1(selectedYear, selectedEducationLevel);
      updateChart2(selectedYear, selectedEducationLevel);
    });

    d3.select("#education-select").on("change", function () {
      const selectedYear = d3.select("#year-select").property("value");
      const selectedEducationLevel = this.value;
      updateChart1(selectedYear, selectedEducationLevel);
      updateChart2(selectedYear, selectedEducationLevel);
    });
  })
  .catch(function (error) {
    console.log("Error loading the CSV data:", error);
  });
  
  //END OF BAR CHART


  const lineMargin = { top: 70, right: 30, bottom: 50, left: 50 };
const lineWidth = 600 - lineMargin.left - lineMargin.right; // Increased width to allow more space for charts
const lineHeight = 500 - lineMargin.top - lineMargin.bottom; // Increased height to allow more room for larger y-axis values

const tooltipLine = d3.select("#tooltip1");

function createLineChart(containerId, region, educationLevel, data) {
// Clear any previous SVG elements before drawing a new one
d3.select(containerId).selectAll("svg").remove();

const svg = d3
.select(containerId)
.append("svg")
.attr(
"viewBox",
`0 0 ${lineWidth + lineMargin.left + lineMargin.right} ${
  lineHeight + lineMargin.top + lineMargin.bottom
}`
)
.attr("preserveAspectRatio", "xMidYMid meet")
.append("g")
.attr("transform", `translate(${lineMargin.left},${lineMargin.top})`);

const x = d3.scaleLinear().domain([2016, 2021]).range([0, lineWidth]);

// Filter and clean data
const filteredData = data.filter(
(d) => d.Region === region && d.Education_Level === educationLevel
);

if (filteredData.length === 0) {
console.warn("No data available for the selected filters.");
return;
}

const uniqueYears = Array.from(new Set(filteredData.map((d) => d.Year)));
const cleanedData = uniqueYears.map((year) => {
const dataForYear = filteredData.filter((d) => d.Year === year);
const maleAvg = d3.mean(dataForYear, (d) => +d.Male_Percentage || 0);
const femaleAvg = d3.mean(dataForYear, (d) => +d.Female_Percentage || 0);
return { year: year, male: maleAvg, female: femaleAvg };
});

// Calculate the maximum value in the data to set the y-axis
const maxYValue = d3.max(cleanedData, (d) => Math.max(d.male, d.female));

// Add padding to the y-axis max value for better visualization
const yMax = maxYValue * 1.1; // Increase by 10% for padding

const y = d3.scaleLinear().domain([0, yMax]).range([lineHeight, 0]);

// Add Axes
svg
.append("g")
.attr("transform", `translate(0,${lineHeight})`)
.call(d3.axisBottom(x).tickFormat(d3.format("d"))); // X Axis - Years

svg
.append("g")
.call(d3.axisLeft(y).tickFormat((d) => `${(d * 100).toFixed(0)}%`)); // Y Axis - Percentage

// Line generator
const lineGenerator = d3
.line()
.x((d) => x(d.year))
.y((d) => y(d.value));

// Draw female line with transition
svg
.append("path")
.datum(cleanedData.map((d) => ({ year: d.year, value: d.female })))
.attr("class", "line")
.attr("d", lineGenerator)
.attr("stroke", "#dc0ab4") // Updated color for Female
.attr("fill", "none")
.attr("stroke-width", 2)
.style("opacity", 0) // Start invisible for transition
.transition()
.duration(1000) // Smooth transition effect
.style("opacity", 1);

// Add points for female data
svg
.selectAll(".dot-female")
.data(cleanedData)
.enter()
.append("circle")
.attr("class", "dot-female")
.attr("cx", (d) => x(d.year))
.attr("cy", (d) => y(d.female))
.attr("r", 4)
.attr("fill", "#dc0ab4")
.on("mouseover", (event, d) => {
tooltipLine
  .style("display", "block")
  .html(`Year: ${d.year}<br>Female: ${(d.female * 100).toFixed(1)}%`)
  .style("left", `${event.pageX + 10}px`)
  .style("top", `${event.pageY}px`);
})
.on("mouseout", () => tooltipLine.style("display", "none"));

// Draw male line with transition
svg
.append("path")
.datum(cleanedData.map((d) => ({ year: d.year, value: d.male })))
.attr("class", "line")
.attr("d", lineGenerator)
.attr("stroke", "#0d88e6") // Updated color for Male
.attr("fill", "none")
.attr("stroke-width", 2)
.style("opacity", 0) // Start invisible for transition
.transition()
.duration(1000) // Smooth transition effect
.style("opacity", 1);

// Add points for male data
svg
.selectAll(".dot-male")
.data(cleanedData)
.enter()
.append("circle")
.attr("class", "dot-male")
.attr("cx", (d) => x(d.year))
.attr("cy", (d) => y(d.male))
.attr("r", 4)
.attr("fill", "#0d88e6")
.on("mouseover", (event, d) => {
tooltipLine
  .style("display", "block")
  .html(`Year: ${d.year}<br>Male: ${(d.male * 100).toFixed(1)}%`)
  .style("left", `${event.pageX + 10}px`)
  .style("top", `${event.pageY}px`);
})
.on("mouseout", () => tooltipLine.style("display", "none"));
}

d3.csv("malefemale34.csv").then((data34) => {
d3.csv("malefemale64.csv").then((data64) => {
data34.forEach((d) => {
d.Year = +d.Year;
d.Female_Percentage = +d.Female_Percentage || 0;
d.Male_Percentage = +d.Male_Percentage || 0;
});

data64.forEach((d) => {
d.Year = +d.Year;
d.Female_Percentage = +d.Female_Percentage || 0;
d.Male_Percentage = +d.Male_Percentage || 0;
});

const region1 = d3.select("#dropdown-region-1").property("value");
const educationLevel1 = d3.select("#dropdown-education-1").property("value");

const region2 = d3.select("#dropdown-region-2").property("value");
const educationLevel2 = d3.select("#dropdown-education-2").property("value");

createLineChart("#chart-1", region1, educationLevel1, data34);
createLineChart("#chart-2", region2, educationLevel2, data64);

d3.select("#dropdown-region-1").on("change", function () {
const selectedRegion = d3.select(this).property("value");
const selectedEducation = d3.select("#dropdown-education-1").property("value");
createLineChart("#chart-1", selectedRegion, selectedEducation, data34);
});

d3.select("#dropdown-education-1").on("change", function () {
const selectedRegion = d3.select("#dropdown-region-1").property("value");
const selectedEducation = d3.select(this).property("value");
createLineChart("#chart-1", selectedRegion, selectedEducation, data34);
});

d3.select("#dropdown-region-2").on("change", function () {
const selectedRegion = d3.select(this).property("value");
const selectedEducation = d3.select("#dropdown-education-2").property("value");
createLineChart("#chart-2", selectedRegion, selectedEducation, data64);
});

d3.select("#dropdown-education-2").on("change", function () {
const selectedRegion = d3.select("#dropdown-region-2").property("value");
const selectedEducation = d3.select(this).property("value");
createLineChart("#chart-2", selectedRegion, selectedEducation, data64);
});
});
});