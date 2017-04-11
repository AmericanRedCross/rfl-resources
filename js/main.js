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
    var width = 960,
        height = 700;
    var projection = d3.geoAlbersUsaTerritories();
    // get the geoPath
    var path = d3.geoPath().projection(projection);
    var svg = d3.select("#container")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g");
    var t = d3.transition();
    var defaultInfo = '<p id="hoverText">Hover over a region to see its resources</p>'
    var Tooldiv = d3.select("#canvas").append("div")
        .attr("id","tooltip")
        .style("opacity", 0);
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
                console.log(this)
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
                          '<div class="imgInner"><img src="img/instructorspng.png"/><p>' + rcRegion.instructor + '</p></div>'
                      )
                  }
                  if(rcRegion.mentor > 0) {
                      programs.push(
                          '<div class="imgInner"><img src="img/mentor.png"/><p>' + rcRegion.mentor + '</p></div>'
                      )
                  }
                  if(rcRegion.outreach > 0) {
                      programs.push(
                          '<div class="imgInner"><img src="img/grantProj.png"/><p>' + rcRegion.outreach + '</p></div>'
                      )
                  }
                  if(rcRegion.phone > 0) {
                      programs.push(
                          '<div class="imgInner"><img src="img/phoneProj.png"/></div>'
                      )
                  }
                  // based on # of programs, set up cards.
                  if(programs.length > 0) {
                      programs = programs.join('')
                      imgs = '<div id="imgs">' + programs + '</div>'
                      regionHTML += imgs
                  } else {
                      imgs = '<div><p id="noResources">There are no resources in this region</p></div>'
                      regionHTML += imgs
                  }
                }
                filterPrograms()
                left = d3.event.pageX
                right = d3.event.pageY
                Tooldiv.transition()
                    .duration(200)
                    .style("opacity",0.9)
                Tooldiv.html(regionHTML)
                    .style("left", left + "px")
                    .style("top", right  + "px")
            })
            .on("mouseout",function() {
                d3.select(this).classed('activeState',false)
                d3.select(this).attr('stroke','rgba(0,0,0,1)')
                Tooldiv.transition()
                    .duration(500)
                    .style("opacity",0)
            });
        })
        svg.append("path")
            .style("fill", 'none')
            .style("stroke","rgba(57,57,57,.2)")
            .style("stroke-dasharray","5,5")
            .attr("d",projection.getCompositionBorders())

        var legend = svg.selectAll('.legend')
                    .data(['Top 10 (1-10)','Top 20 (11-20)','Outside Top 20']).enter()
                    .append('g')
                    .attr('class','legend')
                    .attr('transform',function(d,i){
                      var vert = i * 18;
                      return 'translate(0' + ','
                      + (550 + vert) + ')'
                    });

        legend.append('rect')
                .attr('width',18)
                .attr('height',18)
                .style('fill',function(d){
                if(d=='Top 10 (1-10)'){return "rgba(212,49,52,1)"}
                  else if(d=='Top 20 (11-20)') {return "rgba(241,132,106,1)"}
                  else if(d=='Outside Top 20'){return "rgba(200,199,199,1)"}
                })

            legend.append('text')
                  .attr("x", 22)
                  .attr('y', 14)
                  .attr("font-size","14px")
                  .text(function(d) { return d })

            svg.append('text')
              .attr('x', 0)
              .attr('y', 540)
              .attr('font-size','14px')
              .attr('font-weight','bold')
              .text('RFL Casework')

    }
    function sizeChange() {
	    d3.select("g").attr("transform", "scale(" + $("#container").width()/900 + ")");
	   }

// load map
$(document).ready(function () {
    $(document).foundation();
    var regionData = rflData()
    rflMap()
    sizeChange()
    Foundation.reInit('accordion');
});
$(window).on('resize', function(){
    setTimeout(function() {
      sizeChange()
    }, 300)
})
