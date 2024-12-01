    // Load the dataset and initialize all charts
    d3.csv("total34.csv").then(data => {
        // Data preprocessing
        data.forEach(d => {
          d.Year = +d.Year; // Convert year to numeric
          d.Percentage = +d.Percentage; // Convert percentage to numeric
        });
  
        const years = Array.from(new Set(data.map(d => d.Year))).sort();
        const regions = Array.from(new Set(data.map(d => d.Region))).sort();
  
        // Color scale for Retro Metro theme
        const retroMetroColors = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#ffa300", "#dc0ab4", "#9b19f5"];
        const color = d3.scaleOrdinal(retroMetroColors);
  
        // Year slider control
        const yearSlider = d3.select("#year-slider2");
        const yearLabel = d3.select("#selected-year2");
  
        // Tooltip setup
        const tooltip = d3.select("#tooltip2");
  
        // Switch Age Group Button
        d3.select("#switch-age-group2").on("click", function() {
          window.location.href = "age-group2.html"; // Redirect to total64.html page
        });
  
        // Function to update the displayed year
        function updateYear(year) {
          yearLabel.text(year);
          updateStackedChart(year);
          updateGroupedChart(year);
          updateAverageBarChart(year);
        }
  
        // Update Stacked Bar Chart Function
        function updateStackedChart(year) {
          const yearData = data.filter(d => d.Year == year);
          const eduLevels = Array.from(new Set(data.map(d => d["Education level"])));
          const nestedData = d3.group(yearData, d => d.Region);
          const stackedData = Array.from(nestedData, ([key, values]) => {
            const result = { Region: key };
            values.forEach(d => result[d["Education level"]] = d.Percentage * 100);
            return result;
          });
  
          const stack = d3.stack().keys(eduLevels);
          const series = stack(stackedData);
  
          const svg = d3.select("#stacked-chart2");
          const margin = { top: 20, right: 20, bottom: 100, left: 150 };
          const width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
          const height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
          svg.selectAll("g").remove(); // Clear previous elements
          const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
          const y = d3.scaleBand()
            .domain(Array.from(nestedData.keys()))
            .rangeRound([0, height])
            .padding(0.1);
  
          const x = d3.scaleLinear()
            .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
            .nice()
            .range([0, width]);
  
          // Append y-axis without labels
          g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold");
  
          // Append x-axis without labels
          g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end");
  
          const layerGroups = g.selectAll("g.layer")
            .data(series)
            .enter().append("g")
            .attr("class", "layer2")
            .attr("fill", d => color(d.key));
  
          // Transition for stacked bars
          layerGroups.selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("y", d => y(d.data.Region))
            .attr("x", d => x(d[0]))
            .attr("height", y.bandwidth())
            .attr("width", 0) // Start width as 0 for transition effect
            .transition()
            .duration(1000) // 1-second transition
            .attr("width", d => x(d[1]) - x(d[0]));
  
          // Add tooltip for stacked bars
          layerGroups.selectAll("rect")
            .on("mouseover", function(event, d) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip.html(
                `<strong>Region:</strong> ${d.data.Region}<br>` +
                `<strong>Education Level:</strong> ${d3.select(this.parentNode).datum().key}<br>` +
                `<strong>Percentage:</strong> ${(d[1] - d[0]).toFixed(2)}%`
              )
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                     .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              tooltip.transition().duration(200).style("opacity", 0);
            });
  
          // Update shared legend for stacked and grouped charts
          updateCombinedLegend(eduLevels, color);
        }
  
        // Update Grouped Bar Chart Function
        function updateGroupedChart(year) {
          const yearData = data.filter(d => d.Year == year);
          const regions = Array.from(new Set(yearData.map(d => d.Region)));
          const eduLevels = Array.from(new Set(data.map(d => d["Education level"])));
  
          const svg = d3.select("#grouped-chart2");
          const margin = { top: 20, right: 20, bottom: 100, left: 150 };
          const width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
          const height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
          svg.selectAll("g").remove(); // Clear previous elements
          const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
          const x0 = d3.scaleBand().domain(regions).rangeRound([0, width]).paddingInner(0.1);
          const x1 = d3.scaleBand().domain(eduLevels).rangeRound([0, x0.bandwidth()]).padding(0.05);
          const y = d3.scaleLinear().domain([0, d3.max(yearData, d => d.Percentage)]).nice().rangeRound([height, 0]);
  
          g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end");
  
          g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold");
  
          const regionGroup = g.selectAll(".region")
            .data(yearData)
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d.Region)},0)`);
  
          // Apply transition to grouped bars
          regionGroup.selectAll("rect")
            .data(d => eduLevels.map(level => {
              const entry = yearData.find(e => e.Region === d.Region && e["Education level"] === level);
              return { key: level, value: entry ? entry.Percentage : 0, region: d.Region };
            }))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", height) // Start from the bottom for transition effect
            .attr("width", x1.bandwidth())
            .attr("height", 0) // Start height as 0 for transition effect
            .attr("fill", d => color(d.key))
            .transition()
            .duration(1000) // 1-second transition
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value));
  
          // Add tooltip for grouped bars
          regionGroup.selectAll("rect")
            .on("mouseover", function(event, d) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip.html(
                `<strong>Region:</strong> ${d.region}<br>` +
                `<strong>Education Level:</strong> ${d.key}<br>` +
                `<strong>Percentage:</strong> ${(d.value * 100).toFixed(2)}%`
              )
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                     .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              tooltip.transition().duration(200).style("opacity", 0);
            });
  
          // Update shared legend for stacked and grouped charts
          updateCombinedLegend(eduLevels, color);
        }
  
        // Update Average Percentage Bar Chart Function
        function updateAverageBarChart(year) {
          const yearData = data.filter(d => d.Year == year);
          const regionData = Array.from(
            d3.group(yearData, d => d.Region), 
            ([key, values]) => ({
              Region: key,
              AveragePercentage: d3.mean(values, d => d.Percentage) * 100
            })
          );
  
          const svg = d3.select("#bar-chart2");
          const margin = { top: 20, right: 20, bottom: 100, left: 100 };
          const width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
          const height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
          svg.selectAll("g").remove(); // Clear previous elements
          const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
          const x = d3.scaleBand()
            .domain(regionData.map(d => d.Region))
            .range([0, width])
            .padding(0.2);
  
          const y = d3.scaleLinear()
            .domain([0, d3.max(regionData, d => d.AveragePercentage)])
            .nice()
            .range([height, 0]);
  
          g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end");
  
          g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold");
  
          // Transition for average bars
          const bars = g.selectAll(".bar")
            .data(regionData)
            .enter()
            .append("rect")
            .attr("class", "bar2")
            .attr("x", d => x(d.Region))
            .attr("y", height) // Start from the bottom for transition effect
            .attr("width", x.bandwidth())
            .attr("height", 0) // Start height as 0 for transition effect
            .attr("fill", "#1a53ff") // Color for average bar chart (Retro Metro blue)
            .transition()
            .duration(1000) // 1-second transition
            .attr("y", d => y(d.AveragePercentage))
            .attr("height", d => height - y(d.AveragePercentage));
  
          // Add tooltip for average bars
          g.selectAll("rect")
            .on("mouseover", function(event, d) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip.html(`<strong>Region:</strong> ${d.Region}<br><strong>Percentage:</strong> ${d.AveragePercentage.toFixed(2)}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                     .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              tooltip.transition().duration(200).style("opacity", 0);
            });
  
          // Update legend for average bar chart and place it above the chart
          updateBarChartLegend();
        }
  
        // Update Combined Legend for Stacked and Grouped Charts
        function updateCombinedLegend(eduLevels, color) {
          const legend = d3.select("#shared-legend-container2");
          legend.html(""); // Clear existing legend
  
          const legendItems = legend.selectAll(".legend-item2")
            .data(eduLevels)
            .enter()
            .append("div")
            .attr("class", "legend-item2");
  
          legendItems.append("div")
            .attr("class", "legend-color2")
            .style("background-color", d => color(d));
  
          legendItems.append("span")
            .text(d => d);
        }
  
        // Update Legend for Average Percentage Bar Chart
        function updateBarChartLegend() {
          const legend = d3.select("#bar-legend2");
          legend.html(""); // Clear existing legend
  
          const legendItem = legend.append("div")
            .attr("class", "legend-item2");
  
          legendItem.append("div")
            .attr("class", "legend-color2")
            .style("background-color", "#1a53ff");
  
          legendItem.append("span")
            .text("Average Percentage of Educational Attainment");
        }
  
        // Set initial charts
        updateYear(yearSlider.property("value"));
  
        // Add event listener to slider to update charts based on the selected year
        yearSlider.on("input", function() {
          const selectedYear = this.value;
          updateYear(selectedYear);
        });
  
      });