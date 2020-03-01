var Chart = {};

Chart.rose = function() {

	var margin = {'top': 50, 'right': 50, 'bottom': 50, 'left': 50},
		height = 500,
		width = 500,
		color = 'rgb(0,0,0)',
		area = function(d) { return [d.y]; },
		angle = function(d) { return d.x; },
		radiusScale = d3.scale.linear(),
		angleScale = d3.scale.linear().range( [Math.PI, 3*Math.PI ] ),
		domain = [0, 1],
		legend = [''],
		label = function(d) { return d.label; },
		delay = 0,
		duration = 0,
		canvas, graph, centerX, centerY, numWedges, wedgeGroups, wedges, legendGroup;

	// Arc Generator:
	var arc = d3.svg.arc()
		.innerRadius( 0 )
		.outerRadius( function(d,i) { return radiusScale( d.radius ); } )
		.startAngle( function(d,i) { return angleScale( d.angle ); } );

	function chart( selection ) {

		selection.each( function( data ) {

			numWedges = data.length;

			data = formatData( data );

			updateParams();

			createBase( this );

			createWedges( data );

		});

	}; 

	
	function formatData( data ) {
		data = data.map( function(d, i) {
			return {
				'angle': angle.call(data, d, i),
				'area': area.call(data, d, i),
				'label': label.call(data, d, i)			
			};
		});

		return data.map( function(d, i) {
			return {
				'angle': d.angle,
				'label': d.label,
				'radius': d.area.map( function(area) {
					return Math.sqrt( area*numWedges / Math.PI );
				})
			}
		})
	}; 

	
	function updateParams() {
		arc.endAngle( function(d,i) { return angleScale( d.angle ) + (Math.PI / (numWedges/2)); } );

		centerX = (width - margin.left - margin.right) / 2;
		centerY = (height - margin.top - margin.bottom) / 2;

		radiusScale.domain( domain )
			.range( [0, d3.min( [centerX, centerY] ) ] );

		angleScale.domain( [0, numWedges] );		
	}; 

	
	function createBase( selection ) {

		canvas = d3.select( selection ).append('svg:svg')
			.attr('width', width)
			.attr('height', height)
			.attr('class', 'canvas');

		graph = canvas.append('svg:g')
			.attr('class', 'graph')
			.attr('transform', 'translate(' + (centerX + margin.left) + ',' + (centerY + margin.top) + ')');

	}; 


	function createWedges( data ) {

		wedgeGroups = graph.selectAll('.wedgeGroup')
			.data( data )
		  .enter().append('svg:g')
		  	.attr('class', 'wedgeGroup')
		  	.attr('transform', 'scale(0,0)');

		wedges = wedgeGroups.selectAll('.wedge')
		  	.data( function(d) { 
		  		var ids = d3.range(0, legend.length);

		  		ids.sort( function(a,b) { 
			  		var val2 = d.radius[b],
			  			val1 = d.radius[a]
			  		return  val2 - val1; 
			  	});
			  	return ids.map( function(i) {
			  		return {
			  			'legend': legend[i],
			  			'radius': d.radius[i],
			  			'angle': d.angle
			  		};
			  	});
		  	})
		  .enter().append('svg:path')
		  	.attr('class', function(d) { return 'wedge ' + d.legend; })
		  	.attr('d', arc );

		wedges.append('svg:title')
			.text( function(d) { return d.legend + ': ' + Math.floor(Math.pow(d.radius,2) * Math.PI / numWedges); });

		wedgeGroups.transition()
			.delay( delay )
			.duration( function(d,i) { 
				return duration*i;
			})
			.attr('transform', 'scale(1,1)');

		var numLabels = d3.selectAll('.label-path')[0].length;
		
		wedgeGroups.selectAll('.label-path')
			.data( function(d,i) { 
				return [
					{
						'index': i,
						'angle': d.angle,
						'radius': d3.max( d.radius.concat( [23] ) )
					}
				];
			} )
		  .enter().append('svg:path')
		  	.attr('class', 'label-path')
		  	.attr('id', function(d) {
		  		return 'label-path' + (d.index + numLabels);
		  	})
			.attr('d', arc)
		  	.attr('fill', 'none')
		  	.attr('stroke', 'none');

		wedgeGroups.selectAll('.label')
			.data( function(d,i) { 
				return [
					{
						'index': i,
						'label': d.label
					}
				];
			} )
		  .enter().append('svg:text')
	   		.attr('class', 'label')
	   		.attr('text-anchor', 'start')
	   		.attr('x', 5)
	   		.attr('dy', '-.71em')
	   		.attr('text-align', 'center')
	  		.append('textPath')
	  			.attr('xlink:href', function(d,i) { 
	  				return '#label-path' + (d.index + numLabels);
	  			})
	  			.text( function(d) { return d.label; } );

	}; 	

	chart.margin = function( _ ) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.width = function( _ ) {
		if (!arguments.length) return width;
		width = _;
		return chart;
	};

	chart.height = function( _ ) {
		if (!arguments.length) return height;
		height = _;
		return chart;
	};

	chart.area = function( _ ) {
		if (!arguments.length) return area;
		area = _;
		return chart;
	};

	chart.angle = function( _ ) {
		if (!arguments.length) return angle;
		angle = _;
		return chart;
	};

	chart.label = function( _ ) {
		if (!arguments.length) return label;
		label = _;
		return chart;
	};

	chart.domain = function( _ ) {
		if (!arguments.length) return domain;
		domain = _;
		return chart;
	};

	chart.legend = function( _ ) {
		if (!arguments.length) return legend;
		legend = _;
		return chart;
	};

	chart.delay = function( _ ) {
		if (!arguments.length) return delay;
		delay = _;
		return chart;
	};

	chart.duration = function( _ ) {
		if (!arguments.length) return duration;
		duration = _;
		return chart;
	};

	return chart;

}; 


Chart.legend = function( entries ) {

	var legend = {}, 
		height,
		symbolRadius = 5;

	legend.container = d3.select('body').append('div')
		.attr('class', 'legend');

	height = parseInt( d3.select('.legend').style('height'), 10);
	legend.canvas = legend.container.append('svg:svg')
			.attr('class', 'legend-canvas');

	legend.entries = legend.canvas.selectAll('.legend-entry')
		.data( entries )
	  .enter().append('svg:g')
	  	.attr('class', 'legend-entry')
	  	.attr('transform', function(d,i) { return 'translate('+ (symbolRadius + i*120) +', ' + (height/2) + ')'; });

	legend.entries.append('svg:circle')
		.attr('class', function(d) { return 'legend-symbol ' + d;} )
		.attr('r', symbolRadius )
		.attr('cy', 0 )
		.attr('cx', 0 );

	legend.entries.append('svg:text')
		.attr('class', 'legend-text' )
		.attr('text-anchor', 'start')
		.attr('dy', '.35em')
		.attr('transform', 'translate(' + (symbolRadius*2) + ',0)')
		.text( function(d) { return d; } );

	// Add interactivity:
	legend.entries.on('mouseover.focus', mouseover)
		.on('mouseout.focus', mouseout);

	//
	function mouseover() {

		var _class = d3.select( this ).select('.legend-symbol')
			.attr('class')
			.replace('legend-symbol ', '')

		d3.selectAll('.wedge')
			.filter( function(d,i) {
				return !d3.select( this ).classed( _class );
			})
			.transition()
				.duration( 1000 )
				.attr('opacity', 0.05 );

	}; 

	function mouseout() {

		d3.selectAll('.wedge')
			.transition()
				.duration( 500 )
				.attr('opacity', 1 );

	}; 

}; 

Chart.slider = function( minVal, maxVal, step ) {

	d3.select('body').append('input')
		.attr('class', 'slider')
		.attr('type', 'range')
		.attr('name', 'slider')
		.attr('min', minVal)
		.attr('max', maxVal)
		.attr('step', 0.001)
		.attr('value', maxVal);

	d3.select("input").on("change", function() {
	  var value = Math.round(this.value);

	  d3.selectAll('.wedgeGroup')
	  	.filter( function(d,i) { return i < value; } )
	  	.transition()
	  		.duration( 500 )
	  		.attr( 'transform', 'scale(1,1)');
	  
	  d3.selectAll('.wedgeGroup')
	  	.filter( function(d,i) { return i >= value; } )
	  	.transition()
	  		.duration( 500 )
	  		.attr( 'transform', 'scale(0,0)' );

	});


}; 


