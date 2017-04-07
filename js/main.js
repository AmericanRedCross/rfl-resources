// set current date
function setDate () {
    var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
    var today = new Date()
    var month = months[today.getMonth()]
    var year = today.getFullYear()
    var current = '<h4>' + month + ' ' + year + '</h4>'
    d3.select('#surf').html(current)
}
// get program/resource data as of objects w/RCODE as key
function rflData() {
    d3.csv('data/rcRegion.csv', function(data) {
    regionData = d3.map(data, function(d){return d.RCODE})
    })
}
// draw rflMap, use hover to show program/resource info about each region
function rflMap() {
    var projection = d3.geoAlbersUsaTerritories();
    // get the geoPath
    var path = d3.geoPath().projection(projection);
    var svg = d3.select("#container")
        .classed("svg-container",true)
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 960 500")
        .attr("width","100%")
        .attr("height","100%")
        .classed("svg-content-responsive", true); 
    var t = d3.transition();
    var defaultInfo = '<p id="hoverText">Hover over a region to see its resources</p>'
    d3.select('#info')
        .html(defaultInfo);
    d3.json('data/rcRegion.json',function(error,rc){
        // get geometry out of topojson
        var rc = topojson.feature(rc, rc.objects.rcRegion);
        svg.selectAll(".region")
            .data(rc.features)
            .enter()
            .append("path")
            .attr('class','region')
            .attr('d',path)
            .style("fill",function(d){
                regionRank = regionData["$"+d.properties.RCODE].top20
                if(0 < regionRank && regionRank <= 10) {
                    return "rgba(212,49,52,1)"
                } else if (10 < regionRank && regionRank <= 20) {
                    return "rgba(241,132,106,1)"
                } else {
                    return "rgba(200,199,199,1)"
                }
                })
            .on("mouseover", function(d) {
                d3.select(this).classed('activeState',true)
                this.parentElement.appendChild(this);
                rcRegion = regionData["$"+d.properties.RCODE]
                var region = rcRegion.Region
                var imgs, regionHTML;
                function filterPrograms() {
                var programs = []
                regionHTML = '<p id="regionText">' + region + '</p>'
                // add to programs if region has them. 
                if(rcRegion.instructor > 0 ) {
                    programs.push(
                        '<div class="column"><div class="card"><img src="img/instructorspng.png"/><p>' + rcRegion.instructor + '</p></div></div>'
                    )
                }
                if(rcRegion.mentor > 0) {
                    programs.push(
                        '<div class="column"><div class="card"><img src="img/mentor.png"/><p>' + rcRegion.mentor + '</p></div></div>'
                    )
                }
                if(rcRegion.outreach > 0) {
                    programs.push(
                        '<div class="column"><div class="card"><img src="img/grantProj.png"/><p>' + rcRegion.outreach + '</p></div></div>'
                    )
                }
                if(rcRegion.phone > 0) {
                    programs.push(
                        '<div class="column"><div class="card"><img src="img/phoneProj.png"/></div></div>'
                    )
                }
                // based on # of programs, set up cards.
                if(programs.length > 0) {
                    programs = programs.join('') 
                    imgs = '<div id="imgs"><div class="row small-up-1">' + programs + '</div></div>'
                    regionHTML += imgs
                } 
                else if(programs.length > 1)  {
                    programs = programs.join('')
                    imgs = '<div id="imgs"><div class="row small-up-2">' + programs +      '</div></div>'
                    regionHTML += imgs
                } else {
                    imgs = '<div id="imgs"><div class="row small-up-1"><p id="noResources">There are no resources in this region</p></div></div>'
                    regionHTML += imgs
                }
                }  
                filterPrograms()
                d3.select('#info').html(regionHTML);
            })
            .on("mouseout",function() {
                d3.select(this).classed('activeState',false)
                d3.select('#info').html(defaultInfo);
            });
        })
        
    }

var regionData = rflData()
rflMap()
//Foundation.reInit(['tabs']);
