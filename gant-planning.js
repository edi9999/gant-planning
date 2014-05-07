!function() {
var gantplanning={
	version:"0.0.1"
};

var Planning=function()
{

	this.style={
		phasesColor:d3.rgb("#083968"),
		phasesHeight:"15px"
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
			.attr("class","gant-planning")
		return this;
	}

	this.draw=function()
	{
		var phases=this.mainElement.selectAll("rect.phases")
			.data(this.events);

		phases.enter()
			.append("rect")
			.attr("class","phases")
			.attr("fill",this.style.phasesColor)
			.attr("height",this.style.phasesHeight)
			.attr("width","15px")

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
