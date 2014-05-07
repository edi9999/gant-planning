!function() {
var gantplanning={
	version:"0.0.1"
};

var Planning=function()
{
	_this=this;

	this.style={
		phasesColor:d3.rgb("#083968"),
		stepWidth:20,
		phasesHeight:25,
		textColor:d3.rgb("#F7F7F7"),
		phasesY:30,
		fontsize:16
	};
	
	this.fill=function(phases)
	{
		this.phases=phases;
		return this;
	}

	this.attachTo=function(element)
	{
		this.element=element;
		this.mainElement= d3.select(this.element)
			.attr("class","gant-planning");
		return this;
	}

	var drag = d3.behavior.drag()
		.on("drag", function(d,i) {
			console.log(d)
			console.log(d.x)
			d.dx+=d3.event.dx;
			_this.mainElement.selectAll(".phase-"+i)
				.attr("transform","translate("+[d.dx,0]+")");
		})
		.on("dragend",function(d,i)
		{
			for(i=0;i<_this.events.length;i++) {
				_this.events[i].x+=_this.events[i].dx;
				_this.events[i].dx=0;
			}
			reorderPhases();
			_this.draw();
		});

	var reorderPhases=function()
	{
		_this.phases.sort(function(a,b){
        	var x = a.start+1/100*a.end; var y = b.start+1/100*b.end;
        	if (x<y) return -1;
        	if (x>y) return 1;
			if (a.description<b.description) return -1;
			if (a.description>b.description) return 1;
			return -1;
		})
	}

	var calcCoordinates=function()
	{
		for(i=0;i<_this.phases.length;i++) {
			var ev=_this.phases[i];
			ev.x=(ev.start-1)*_this.style.stepWidth;
			ev.y=_this.style.phasesY+i*_this.style.phasesHeight;
			ev.dx=0;
			ev.dy=0;
			ev.textx=(ev.start+ev.end-2)/2*_this.style.stepWidth;
			ev.texty=_this.style.phasesY+17+i*_this.style.phasesHeight;
			_this.phases[i]=ev;
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
			.attr("width",function(v,i){return (v.end-v.start)*_this.style.stepWidth+"px"})
			.attr("transform","translate("+[0,0]+")")
			.attr("x",function(v,i){return v.x+"px"})
			.attr("y",function(v,i){return v.y+"px"})
			.call(drag);
	}

	var updateDescriptions=function()
	{
		var descriptions=_this.mainElement.selectAll("text.description")
			.data(_this.phases);

		descriptions.enter()
			.append("text")
			.attr("class",function(v,i){return "description phase-"+i})
			.attr("x",function(v,i){return v.textx+"px"})
			.attr("y",function(v,i){return v.texty+"px"})
			.attr("fill",_this.style.textColor)
			.attr("transform","translate("+[0,0]+")")
			.attr("text-anchor","middle")
			.attr("font-size",_this.style.fontsize)
			.text(function(d){return d.description})
			.call(drag);
	}

	this.draw=function()
	{
		var _this=this;
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
