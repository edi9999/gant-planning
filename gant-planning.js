!function() {
var gantplanning={
	version:"0.1.0"
};

var Planning=function()
{
	_this=this;

	this.style={
		phasesColor:d3.rgb("#083968"),
		stepWidth:40,
		phasesHeight:35,
		textColor:d3.rgb("#F7F7F7"),
		phasesY:30,
		fontsize:16
	};

	this.params={
		sticky:0.4,
		border:0.3
	}
	
	this.fill=function(phases)
	{
		this.phases=phases;
		for(i=0;i<this.phases.length;i++){
			this.phases[i].dx=0;
			this.phases[i].dy=0;
		}
		return this;
	}

	this.attachTo=function(element)
	{
		this.element=element;
		this.mainElement= d3.select(this.element)
			.attr("class","gant-planning");
		return this;
	}

	var move="";

	var drag = d3.behavior.drag()
		.on("dragstart", function(d,i) {
			var type=d3.event.sourceEvent.srcElement.nodeName;

			var xleft=d3.event.sourceEvent.offsetX;
			console.log(type);
			if (type=="rect")
				xleft-=d.x;
			if (type=="text")
				xleft-=d.x;

			move="";

			if (Math.abs(xleft)<_this.params.border*_this.style.stepWidth)
				{
					console.log("west")
					move="w";
				}

			var xright=xleft-d.width;

			console.log(xleft,xright);
			if (Math.abs(xright)<_this.params.border*_this.style.stepWidth)
				{
					move="o";
				}
		})
		.on("drag", function(d,i) {
			d.dx+=d3.event.dx;
			//Sticky edges
			var distance=Math.abs(Math.round(timeToCoordinate.invert(d.dx))-timeToCoordinate.invert(d.dx));
			if (distance<_this.params.sticky)
				{
					d.rx= timeToCoordinate(Math.round(timeToCoordinate.invert(d.dx)));
				}
			else
				{
					d.rx=d.dx;
				}

		console.log(move)
			if (move=="")
				_this.mainElement.selectAll(".phase-"+i)
					.attr("transform","translate("+[d.rx,0]+")");
			if (move=="o")
				_this.mainElement.selectAll(".phase-"+i)
					.attr("width",function(v){return (v.width+d.rx)+"px"})
		})
		.on("dragend",function(d,i)
		{
			for(i=0;i<_this.phases.length;i++) {
				var phase=_this.phases[i];
				if(move=="") {
					phase.x+=phase.dx;
					var newStart=Math.round(timeToCoordinate.invert(phase.x));
					phase.end=newStart+phase.end-phase.start
					phase.start=newStart
				}
				if (move=="o") {
					console.log(phase.end)
					console.log(timeToCoordinate.invert(phase.x+phase.width+phase.dx))
					phase.end=Math.round(timeToCoordinate.invert(phase.x+phase.width+phase.dx))+2
					console.log(phase.end)
				}
				phase.dx=0;
			}
			reorderPhases();
			_this.draw();
		});

	var reorderPhases=function()
	{
		_this.phases.sort(function(a,b){
			var x = a.start+1/100*a.end; 
			var y = b.start+1/100*b.end;
			if (x<y) return -1;
			if (x>y) return 1;
			if (a.description<b.description) return -1;
			if (a.description>b.description) return 1;
			return -1;
		});
	}

	var timeToCoordinate = d3.scale.linear()
		.domain([1,2])
		.range([0,_this.style.stepWidth]);

	var calcCoordinates=function()
	{
		for(i=0;i<_this.phases.length;i++) {
			var phase=_this.phases[i];
			phase.x=timeToCoordinate(phase.start);
			phase.textx=timeToCoordinate((phase.start+phase.end-2)/2);
			phase.width=timeToCoordinate(phase.end-phase.start-1);
			phase.y=_this.style.phasesY+i*_this.style.phasesHeight;
			phase.texty=_this.style.phasesY+17+i*_this.style.phasesHeight;
			_this.phases[i]=phase;
		}
	}

	var updatePhases=function()
	{
		var phases=_this.mainElement.selectAll("rect.phase")
			.data(_this.phases);

		phases.enter()
			.append("rect")
			.attr("class",function(v,i){return "phase phase-"+i})
			.attr("fill",_this.style.phasesColor)
			.attr("height",_this.style.phasesHeight+"px")

		phases
			.attr("width",function(v){return v.width+"px"})
			.attr("transform","translate("+[0,0]+")")
			.attr("x",function(v){return v.x+"px"})
			.attr("y",function(v){return v.y+"px"})
			.call(drag);
	}

	var updateDescriptions=function()
	{
		var descriptions=_this.mainElement.selectAll("text.description")
			.data(_this.phases);

		descriptions.enter()
			.append("text")
			.attr("class",function(v,i){return "description phase-"+i})
			.attr("text-anchor","middle")
			.attr("font-size",_this.style.fontsize)
			.attr("fill",_this.style.textColor)

		descriptions
			.attr("transform","translate("+[0,0]+")")
			.attr("x",function(v,i){return v.textx+"px"})
			.attr("y",function(v,i){return v.texty+"px"})
			.text(function(d){return d.description})
			.call(drag);
	}

	this.draw=function()
	{
		calcCoordinates();
		updatePhases();
		updateDescriptions();
		return this;
	}

	this.phases=[];
}

gantplanning.createPlanning=function(planning)
{
	return new Planning();
}

this.gantplanning=gantplanning;
}()
