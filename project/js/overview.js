const width = 860;
const height = 600;
let selectedGender = "Female"; // Default gender for donut chart
let currentYear = "2016";
let currentDataset = "malefemale34.csv";
let currentRegion = null; // Keep track of the current region

const years = ["2016", "2017", "2018", "2019", "2020", "2021"];

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
const tooltip = d3.select("#tooltip0");

// Update gender selection
d3.select("#gender").on("change", function () {
  selectedGender = this.value;
  if (currentRegion) {
    loadCSVAndUpdateChart(currentDataset, currentYear, currentRegion);
  }
});

// Update year on slider input
d3.select("#year-slider input").on("input", function () {
  currentYear = years[this.value];
  loadCSVAndUpdateMap(currentDataset, currentYear);
  d3.select("#slider-year").text(currentYear);
});

// Update dataset on dropdown change
d3.select("#dataset").on("change", function () {
  currentDataset = this.value;
  loadCSVAndUpdateMap(currentDataset, currentYear);
  if (currentRegion) {
    loadCSVAndUpdateChart(currentDataset, currentYear, currentRegion);
  }
});

// Load GeoJSON for the map
d3.json("aus.json").then((geoData) => {
  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);

  svg
    .selectAll(".region")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("class", "region")
    .attr("d", path)
    .attr("fill", "#ccc") // Default fill color
    .on("mouseover", function (event, d) {
      console.log("Mouseover on:", d.properties.STATE_NAME); // Debugging
      d3.select(this).classed("highlighted", true);
      const { STATE_NAME } = d.properties;
      tooltip
        .style("opacity", 1) // Make tooltip visible
        .html(`<strong>${STATE_NAME}</strong>`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function () {
      d3.select(this).classed("highlighted", false);
      tooltip.style("opacity", 0); // Hide tooltip
    })
    .on("click", function (event, d) {
      const { STATE_NAME } = d.properties;
      currentRegion = STATE_NAME;
      loadCSVAndUpdateChart(currentDataset, currentYear, STATE_NAME);
    });

  loadCSVAndUpdateMap(currentDataset, currentYear);
});

// Slider input handler
d3.select("#year-slider input").on("input", function () {
  currentYear = years[this.value];
  loadCSVAndUpdateMap(currentDataset, currentYear);

  // Automatically update the donut chart if a region is selected
  if (currentRegion) {
    loadCSVAndUpdateChart(currentDataset, currentYear, currentRegion);
  }

  d3.select("#slider-year").text(currentYear);
});

// Map click handler
function loadCSVAndUpdateMap(dataset, year) {
  d3.csv(dataset).then((eduData) => {
    const filteredData = eduData.filter((d) => d.Year === year);

    // Prepare data for the map tooltips
    const eduDataMap = filteredData.reduce((acc, d) => {
      if (!acc[d.Region]) {
        acc[d.Region] = { Female: 0, Male: 0, Count: 0 };
      }
      acc[d.Region].Female += +d.Female_Percentage;
      acc[d.Region].Male += +d.Male_Percentage;
      acc[d.Region].Count += 1;
      return acc;
    }, {});

    Object.keys(eduDataMap).forEach((region) => {
      const data = eduDataMap[region];
      data.Avg_Female = data.Female / data.Count;
      data.Avg_Male = data.Male / data.Count;
    });

    // Update map tooltips
    svg
      .selectAll(".region")
      .on("mouseover", function (event, d) {
        const { STATE_NAME } = d.properties;
        const regionData = eduDataMap[STATE_NAME];
        if (regionData) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${STATE_NAME}</strong><br>
        Year: ${year}<br>
        Average Female Percentage: ${
          regionData.Avg_Female.toFixed(2) * 100
        }%<br>
        Average Male Percentage: ${regionData.Avg_Male.toFixed(2) * 100}%`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        } else {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${STATE_NAME}</strong><br>No data available for ${year}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        }
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      })
      .on("click", function (event, d) {
        const { STATE_NAME } = d.properties;
        currentRegion = STATE_NAME; // Set the selected region
        loadCSVAndUpdateChart(dataset, year, STATE_NAME);
      });
  });
}

// Update donut chart dynamically when the year changes or region is clicked
function loadCSVAndUpdateChart(dataset, year, regionName) {
  d3.csv(dataset).then((eduData) => {
    const filteredData = eduData.filter(
      (d) => d.Year === year && d.Region === regionName
    );

    console.log("Filtered Data for Donut Chart:", filteredData);

    if (filteredData.length === 0) {
      alert(`No data available for ${regionName}`);
      return;
    }

    const data = filteredData.map((d) => ({
      category: d.Education_Level,
      value: +d[`${selectedGender}_Percentage`],
    }));

    renderDonutChart(data, regionName, selectedGender);
  });
}

function renderDonutChart(data, regionName, gender) {
  const width = 500; // SVG width
  const height = 700; // SVG height
  const radius = Math.min(width, height - 150) / 2 - 50; // Adjusted radius

  // Clear previous chart
  const svg = d3
    .select("#chart svg")
    .attr("width", width)
    .attr("height", height)
    .html("");

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 20) // Position title higher
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Education Level (${gender}) for ${regionName}`);

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2 - 100})`);

  const colors = [
    "#e60049",
    "#0bb4ff",
    "#50e991",
    "#e6d800",
    "#ffa300",
    "#dc0ab4",
    "#9b19f5",
  ];
  const color = d3.scaleOrdinal().range(colors);

  const pie = d3.pie().value((d) => d.value);
  const arc = d3
    .arc()
    .innerRadius(radius / 2)
    .outerRadius(radius);

  const arcs = g.selectAll(".arc").data(pie(data)).enter().append("g");

  // Add paths with transition
  arcs
    .append("path")
    .attr("fill", (d) => color(d.data.category))
    .transition()
    .duration(1000) // 1-second transition
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(i(t));
      };
    });

  // Add tooltips with mouseover
  arcs
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.data.category}</strong><br>Value: ${(
            d.data.value * 100
          ).toFixed(1)}%`
        ) // Multiply by 100 and format to 1 decimal place
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Add legend below the donut chart
  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width / 2 - 250}, ${height / 2 + radius / 2 + 50})`
    ); // Adjust vertical positioning closer to the donut chart

  const legendItemHeight = 20;

  data.forEach((d, i) => {
    // Add colored rectangles
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", i * legendItemHeight)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(d.category));

    // Add text labels
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", i * legendItemHeight + 12) // Adjust vertical alignment
      .style("font-size", "14px")
      .text(d.category);
  });
}