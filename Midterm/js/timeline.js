document.addEventListener('DOMContentLoaded', function(){
    drawChart();
  });
  
  function drawChart() {
    const svg = d3.select(" #timelineChart").append("svg").attr('id','Chart').attr("width", '100%').attr("height", "200");
    d3.json("data/timeline.json").then(function(data) {
      svg.append('line').attr('class', 'timeline-base')
        .attr("x1", 0)
        .attr("y1", 100)
        .attr("x2", '98%')
        .attr("y2", 100);

      // Get the value of the svg to for scaleLinear
      function getLineVal(val) {
        if(val === 'max') {
          let el = document.getElementById('Chart');
          return el.getBoundingClientRect().width;
        }
        else {
          return 0;
        }
      }

      // Convert to UNIX timestamp
      function convertToTimeStamp(date) {
        let parts = date.match(/(\d{4})-(\d{2})-(\d{2})/);
        return new Date(parts[1]+ '-'+parts[2]+'-'+parts[3]).getTime();
      }
  
      let scaleLine = d3.scaleLinear()
        .domain([-4102373222, Date.now()])
        .range([getLineVal('min') + 705 , getLineVal('max') - 25 ]); // OFFSET = 20
  
      let scaleCircle = d3.scaleLinear()
        .domain([moment.duration(3,'d').asMilliseconds(), moment.duration(10,'y').asMilliseconds()])
        .range([9, 9]);
  
      let allGroups = svg.selectAll('g').data(data);
      let group = allGroups.enter().append('g').attr('id', function(data){return 'group-' + data.id});
  
      group.append('circle')
        .attr('cx', function(data) {return scaleLine(convertToTimeStamp(data.date));})
        .attr('cy', 100)
        .attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));})
        .attr('fill-opacity', 0.5)
        .attr('class', function(data) { return('circle-category circle-' + data.category.toLowerCase())})
        .attr('id', function(data) {
          return 'circle-' + data.id
        })

        // When hover a circle
        .on('mouseover', function(d, i) {
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date)) + 20;});
          d3.select(this).classed('circle-hovered', true);
          d3.select(this.parentNode).selectAll('text').style('opacity', 1);
          d3.select(this.parentNode).selectAll('.text-place').classed('hovered', true).style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-desc').classed('hovered', true).style('opacity', 0);
          
        })
        // When click a circle
        .on('click', function(d, i){
          d3.select(this).attr('r', 2000);
          d3.selectAll('line').style('opacity', 0);
          d3.selectAll('circle').filter(function() {
            return !this.classList.contains('circle-hovered');
          }).style('opacity', 0);
          d3.select(this).classed('circle-clicked', true);
          d3.select(this.parentNode).selectAll('.text-position').style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-date').style('opacity', 0);
          d3.selectAll('.details').style('display', 'none');
          setTimeout(function() {
            svg.attr('height', 0);
          }, 450)
          let currId = this.getAttribute('id').split('-')[1];
          let details = d3.select('#details-' + currId);
          details.style('display', 'block');
          details.style('opacity', 1);
          $.getScript('js/history.js',function(){panToMarker(d.id);
          });
        })

        // When un-hover a circle
        .on('mouseout', function(d, i){
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));});
          d3.select(this).classed('circle-hovered', false);
          d3.select(this.parentNode).selectAll('text').style('opacity', 0);
        });
  
      group.append('text')
        .style('opacity', 0)
        .text(function(data) { return(data.title);})
        .attr('x', function(data) {
          let elementWitdh = this.getBoundingClientRect().width;
          // Avoid overflow
          if(scaleLine(convertToTimeStamp(data.date)) + elementWitdh >= getLineVal('max')) {
            return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
          }
          else {
            return scaleLine(convertToTimeStamp(data.date));
          }
        })
        .attr('y', 150)
        .attr('class', 'text-position');
  
      group.append('text')
        .text(function(data) {
        // Get only YYYY-MM
        if(data.date.length > 7) {
          return (data.date.slice(0,7))
        }
        else {
          return(data.date)
        }
      })
      .attr('x', function(data) {
        // Get sibling to have the len and align the date
        let elementWitdh= this.getBoundingClientRect().width;
        let positionWidth = this.parentNode.querySelector('text.text-position').getBoundingClientRect().width;
        if(scaleLine(convertToTimeStamp(data.date)) + positionWidth >= getLineVal('max')) {
          return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
        }
        else {
          return scaleLine(convertToTimeStamp(data.date));
        }
      })
      .attr('y', 130)
      .attr('class', 'text-date')
      .style('opacity', 0);
  
      data.map(d => {
        let details = d3.select('.sidebar').append('div').classed('details', true).classed('details-' + d.category.toLowerCase(), true).attr('id', 'details-' + d.id);
        details.append('i').classed('material-icons close-icon', true).text('close');
        details.append('div').classed(' .title', true).append('span').classed('position-title text-position', true).text(d.title);
        details.append('div').classed('title', true).append('span').classed('date text-date date-title', true).text(d.date);
        details.append('div').classed('place-name text-place hovered', true).text(d.location);
        details.selectAll('.img').style('display', 'none');
        details.append('div')
          .attr('class', 'text-desc')
          .attr('id', 'descriptionId-'+ d.id)
          .text(function(){
            if(typeof(d.description) === 'string') {
              return d.description;
            }
            else {
              return d.description.toString()
            }
          });
        details.style('opacity', 0);
      });
  
      // Hide the details div (once opened by clicking on circle)
      d3.selectAll('.close-icon').on('click', function() {
        map.fitBounds(history.getBounds());
        d3.select(this.parentNode).style('opacity', 0);
        setTimeout(function() {
          svg.attr('height', 200);
          d3.select('.timeline-base').style('opacity', 1)
          d3.selectAll('circle').classed('circle-clicked', false);
          d3.selectAll('circle').style('opacity', 1);
          d3.selectAll('.details').style('display', 'block');
        }, 1000)
      })
    });
  }
  