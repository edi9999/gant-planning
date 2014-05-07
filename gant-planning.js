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
	
	this.fill=function(events)
	{
		this.events=events;
		return this;
	}

	this.attachTo=function(element)
	{
		this.element=element;
		this.mainElement= d3.select(this.element)
			.attr("class","gant-planning");
		return this;
	}

	var updatePhases=function()
	{
		var phases=_this.mainElement.selectAll("rect.phase")
			.data(_this.events);

		phases.enter()
			.append("rect")
			.attr("class","phase")
			.attr("fill",_this.style.phasesColor)
			.attr("height",_this.style.phasesHeight+"px")
			.attr("width",function(v,i){return (v.end-v.start)*_this.style.stepWidth+"px"})
			.attr("x",function(v,i){return (v.start-1)*_this.style.stepWidth+"px"})
			.attr("y",function(v,i){return _this.style.phasesY+i*_this.style.phasesHeight+"px"});
	}

	var updateDescriptions=function()
	{
		var descriptions=_this.mainElement.selectAll("text.description")
			.data(_this.events);

		descriptions.enter()
			.append("text")
			.attr("class","description")
			.attr("x",function(v,i){return (v.start+v.end-2)/2*_this.style.stepWidth+"px"})
			.attr("y",function(v,i){return _this.style.phasesY+17+(i)*_this.style.phasesHeight+"px"})
			.attr("fill",_this.style.textColor)
			.attr("text-anchor","middle")
			.attr("font-size",_this.style.fontsize)
			.text(function(d){return d.description});
	}

	this.draw=function()
	{
		var _this=this;
		updatePhases();
		updateDescriptions();
		return this;
	}

	this.events=[];
}

gantplanning.createPlanning=function(planning)
{
	return new Planning();
}

this.gantplanning=gantplanning;
}()
