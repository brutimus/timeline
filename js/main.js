//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "../bower_components/d3/d3.js"


var data = [{
	title: '2000',
	description: 'Lorem Ipsum',
	image: 'http://dummyimage.com/900x600/eeeeee/000000.png'
},
{
	title: '2001',
	description: 'Lorem Ipsum',
	image: 'http://dummyimage.com/900x600/eeeeee/000000.png'
},
{
	title: '2002',
	description: 'Lorem Ipsum',
	image: 'http://dummyimage.com/900x600/eeeeee/000000.png'
},
{
	title: '2003',
	description: 'Lorem Ipsum',
	image: 'http://dummyimage.com/900x600/eeeeee/000000.png'
}];

$(document).ready(function() {
	var canvas = d3.select('.canvas');
	canvas.append('ul')
		.attr('class', 'timeline-controls')
		.selectAll('li')
		.data(data)
		.enter()
		.append('li')
		.attr('class', 'timeline-point')
		.text(function(d){
			return d['title'];
		})
		.on('click', function(d){
			d3.selectAll('.content img')
				.style('display', 'none');
			d3.select('#year-' + d['title'])
				.style('display', 'block');
			// console.log(d3.select(this).getBoundingClientRect())
		});

	canvas.select('ul.timeline-controls')
		.append('li')
		.attr('class', 'hover timeline-point')
		.html('&nbsp');

	canvas.append('div')
		.attr('class', 'content')
		.selectAll('img')
		.data(data)
		.enter()
		.append('img')
		.attr('src', function(d){return d['image'] + '&text=' + d['title'];})
		.attr('id', function(d){return 'year-' + d['title'];});
	
});