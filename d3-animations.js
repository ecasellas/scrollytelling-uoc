// Definim la mida de l'espai de treball on anirem mostrant les figures
const margin = { top: 50, right: 25, bottom: 45, left: 50 },
    width = 700 - margin.left - margin.right,
    height = 520 - margin.top - margin.bottom;


// Creem un SVG a partir de l'id map-container (div) per al mapa
const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Creem una projecció per al mapa, Mercator en aquest cas
const projection = d3.geoMercator()
    .center([1.5, 41.8])
    .scale(8500)
    .translate([width / 2, height / 2]);

// Definim un punt central de Catalunya, per tal de mostrar-la al centre
const [lon, lat] = [1.5, 41.8];
const [x, y] = projection([lon, lat]);

initialTransform = d3.zoomIdentity.translate(width / 2 - x, height / 2 - y).scale(1);

// Creem un generador Path
const path = d3.geoPath().projection(projection);

// Creem un grup per controlar el GeoJSON dels limits de Catalunya
const limitsGroup = svg.append("g");

// Creem un grup per controlar el GeoJSON dels embassaments
const embassamentsGroup = svg.append("g");

// Creem un grup per controlar el gràfic d'evolució temporal
const evolucioGroup = svg.append("g")
    .attr("class", "evolucio-group");

// Creem un grup per controlar les dades sobreimpressionades
const dadesGroup = svg.append("g");

// Definim la possiblitat que al mapa s'hi pugui fer zoom
const zoom = d3.zoom()
    .scaleExtent([1, 10]) 
    .on("zoom", zoomed);

// Carreguem les dades dels límits de Catalunya i els dibuixem afegint-ho al path
d3.json("data/catalunya.geojson").then(function (geojson) {
    limitsGroup.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "Ivory")
        .attr("stroke", "DarkGray")
        .attr("stroke-width", 1);
});

// Definim l'opacitat inicial de l'svg
svg.attr("opacity", 0)

// Funció que redibuixa els límits i els embassaments quan es fa zoom
function zoomed() {
    limitsGroup.selectAll("path")
        .attr("transform", d3.event.transform);

    embassamentsGroup.selectAll("path")
        .attr("transform", d3.event.transform);
}

// Funció per controlar què passa quan es passa el ratolí per sobre d'un embassament
function handleMouseOver(d) {
    // S'elimina qualsevol tooltip que hi hagi creat
    d3.select(".tooltip").remove();

    // Es crea un nou tooltip
    const tooltip = d3.select("#map-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Es mostra al tooltip el nom de l'embassament
    tooltip.transition()
        .duration(100)
        .style("opacity", 0.9);
    tooltip.html(d.properties.name)
        .style("left", (d3.event.offsetX) + "px")
        .style("top", (d3.event.offsetY - 28) + "px");
}

// Funció per a controlar què pasa quan el ratolí surt de l'embassament
function handleMouseOut() {
    // Se selecciona el tooltip creat, es difumina, i s'esborra
    const tooltip = d3.select(".tooltip");
    tooltip.transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
}

// Funció per a ensenyar el mapa, opacity -> 1
function showMap() {
    svg.transition().duration(50).style("opacity", 1)
    limitsGroup.append("text")
    .attr("x", 520)
    .attr("y", 250)
    .attr("text-anchor", "end")
    .html("-1000 mm")
    .style("opacity", 0)
    .style("font-size", "90px")
    .style("font-weight", 700)
    .style("fill", "LightCoral")
    .transition()
    .duration(2000)
    .style("opacity", 1);
}

// Funció per a amagar el mapa, opacity -> 0
function hideMap() {
    svg.transition().duration(800).style("opacity", 0)
    limitsGroup.transition().duration(800).style("opacity", 0)
}

// Funció per a afegir els embassaments al mapa
function addEmbassaments() {
    // Carreguem les dades dels embassaments i els dibuixem
    d3.json("data/Embassaments.geojson").then(function (geojson) {
        embassamentsGroup.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "CornflowerBlue")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .style("opacity", 0)
            .transition()
            .duration(150)
            .style("opacity", 0.8);
    });

    limitsGroup.selectAll("text").transition().duration(800).style("opacity", 0)
}

// Funció per a esborrar els embassament del mapa, opacity -> 0
function removeEmbassaments() {
    embassamentsGroup.selectAll("path")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove();
    
    limitsGroup.selectAll("text").transition().duration(300).style("opacity", 1)
}

// Funció per a fer un zoom al sistema Sau-Susqueda
function zoomInSauSusqueda() {
    // Es defineixen les coordenades d'interès, crec que s'ha de tenir en compte l'escala
    // en algun punt, per això no coincideix amb les esperades de l'embassament
    const [lon, lat] = [29.0, 35.0]; 
    const [x, y] = projection([lon, lat]);

    const transform = d3.zoomIdentity.translate(width / 10 - x, height / 10 - y).scale(10);
    svg.transition().duration(1000).call(zoom.transform, transform);
}

// Funció per a afegir el text de Sau-Susqueda
function addTextSauSusqueda() {
    // Regulem el paràmetre opacity
    dadesGroup.style("opacity", 0.0).transition().duration(300).style("opacity", 0.8);
    embassamentsGroup.transition().duration(300).style("opacity", 1)

    // Afegim el text, segurament hi ha una manera més compacta de fer-ho...
    dadesGroup.append("text")
        .attr("x", 130)
        .attr("y", 35)
        .attr("text-anchor", "end")
        .html("Sau")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 130)
        .attr("y", 65)
        .attr("text-anchor", "end")
        .html("165.3 hm³")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 130)
        .attr("y", 135)
        .attr("text-anchor", "end")
        .html("10.9%")
        .style("opacity", 0)
        .style("font-size", "60px")
        .style("font-weight", 700)
        .style("fill", "LightCoral")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 350)
        .attr("y", 35)
        .attr("text-anchor", "end")
        .html("Susqueda")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 350)
        .attr("y", 65)
        .attr("text-anchor", "end")
        .html("233.0 hm³")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 350)
        .attr("y", 135)
        .attr("text-anchor", "end")
        .html("19.3%")
        .style("opacity", 0)
        .style("font-size", "60px")
        .style("font-weight", 700)
        .style("fill", "LightCoral")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 570)
        .attr("y", 35)
        .attr("text-anchor", "end")
        .html("El Pasteral")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 570)
        .attr("y", 65)
        .attr("text-anchor", "end")
        .html("1.3 hm³")
        .style("opacity", 0)
        .style("font-size", "30px")
        .style("font-weight", 700)
        .style("fill", "LightSlateGrey")
        .transition()
        .duration(2000)
        .style("opacity", 1);

    dadesGroup.append("text")
        .attr("x", 570)
        .attr("y", 135)
        .attr("text-anchor", "end")
        .html("79.1%")
        .style("opacity", 0)
        .style("font-size", "60px")
        .style("font-weight", 700)
        .style("fill", "LightGreen")
        .transition()
        .duration(2000)
        .style("opacity", 1);

}

// Funció per a esborrar el text de Sau-Susqueda, opacity -> 0
function removeTextSauSusqueda() {
    dadesGroup.style("opacity", 1).transition(15000).style("opacity", 0);
}

// Funció per a fer zoom out del sistema Sau-Susqueda i tornar al punt inicial de zoom
function zoomOutSauSusqueda() {
    svg.selectAll("text").remove();
    svg.transition().duration(1000).call(zoom.transform, initialTransform);
}

// Funció per a afegir la gràfica d'evolució temporal
function addEvolucioTemporal() {
    // Ajustem el paràmetre opacity
    evolucioGroup.style("opacity", 0).transition().duration(800).style("opacity", 0.8)
    embassamentsGroup.style("opacity", 1).transition().duration(800).style("opacity", 0)

    // Carreguem les dades de precentatge de volum embassat
    d3.json("data/dades_conjuntes.json").then(function (lineChartData) {
        // Convertim l'string a date
        const parseDate = d3.timeParse("%Y-%m-%d");
        lineChartData.forEach(d => {
            d.date = parseDate(d.date);
            d.percentatge_x = +d.percentatge_x;
            d.percentatge_y = +d.percentatge_y;
        });

        // Es crea l'eix X en funció dels valors de l'extensió
        const xScale = d3.scaleTime()
            .domain(d3.extent(lineChartData, d => d.date))
            .range([0, width]);

        // Es crea l'eix Y en funció dels valors de l'extensió i hardcoded de les dades
        const yScale = d3.scaleLinear()
            .domain([6, 26])
            .range([height, 0]);

        // Es crea la primera línia
        const line1 = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.percentatge_x));
        // Es crea la segona línia
        const line2 = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.percentatge_y));

        // S'afegeix la línia 1 al grup evolució
        evolucioGroup.append("path")
            .data([lineChartData])
            .attr("d", line1)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);
        // S'afegeix la línia 2 al grup evolució
        evolucioGroup.append("path")
            .data([lineChartData])
            .attr("d", line2)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .style("z-index", 1)
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);

        // Es dibuixa l'eix X
        evolucioGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);

        // Es dibuixa l'eix Y
        evolucioGroup.append("g")
            .call(d3.axisLeft(yScale))
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);

        // S'afegeix l'etiqueta de l'eix Y
        evolucioGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left) // Adjust the position as needed
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .text("Percentatge volum embassat (%)");

        // S'afegeix la llegenda
        const legend = evolucioGroup.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 100}, 20)`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "steelblue")
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);;

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Susqueda")
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "orange")
            .attr("y", 20)
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 29)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Sau")
            .style("opacity", 0)
            .transition()
            .duration(800)
            .style("opacity", 1);
    });
}

// Funció per a amagar l'evolució temporal, opacity -> 0
function removeEvolucioTemporal() {
    evolucioGroup.style("opacity", 1).transition().duration(800).style("opacity", 0)
}

