!function() {

var gantplanning={
	version:"0.1.0"
};

var Planning=function()
{
	_this=this;

	this.style={
		phasesColor:d3.rgb("#083968"),
		stepWidth:100,
		phasesHeight:35,
		textColor:d3.rgb("#F7F7F7"),
		phasesY:30,
		fontsize:16
	};

	this.params={
		sticky:0.1,
		border:0.3
	}
	
	var cleanPhase=function(phase) {
		phase.dx=0;
		phase.dy=0;
		return phase;
	}

	this.fill=function(phases) {
		this.phases=phases;
		for(i=0;i<this.phases.length;i++){
			this.phases[i]=cleanPhase(this.phases[i]);
		}
		return this;
	}

	this.addPhase=function(phase) {
		this.phases.push(cleanPhase(phase));
		this.draw()
	}

	this.attachTo=function(element) {
		this.element=element;
		this.mainElement= d3.select(this.element)
			.attr("class","gant-planning");
		return this;
	}

	var detectMoveDirection=function(xleft,width){
		if (Math.abs(xleft)<_this.params.border*_this.style.stepWidth) {
				return "left";
			}
		var xright=xleft-width;

		if (Math.abs(xright)<_this.params.border*_this.style.stepWidth) {
				return "right";
			}
		return "none";
	}

	var drag = d3.behavior.drag()
		.on("dragstart", function(d,i) {
			var type=d3.event.sourceEvent.srcElement.nodeName;
			var xleft=d3.event.sourceEvent.offsetX;
			if (type=="rect")
				xleft-=d.x;
			if (type=="text")
				xleft-=d.x;

			moveDirection=detectMoveDirection(xleft,d.width)
		})
		.on("drag", function(d,i) {
			d.dx+=d3.event.dx;
			//Sticky edges
			var difference=Math.round(timeToCoordinate.invert(d.dx))-timeToCoordinate.invert(d.dx);
			var distance=Math.abs(difference);
			if (distance<_this.params.sticky) {
					d.rx= timeToCoordinate(Math.round(timeToCoordinate.invert(d.dx)));
				}
			else {
					d.rx=d.dx;
				}

			if (moveDirection=="none") {
				_this.mainElement.selectAll(".phase-"+i)
					.attr("transform","translate("+[d.rx,0]+")");
			}
			if (moveDirection=="right") {
				_this.mainElement.selectAll(".phase-"+i)
					.attr("width",function(v){return (v.width+d.rx)+"px"})
			}
			if (moveDirection=="left") {
				_this.mainElement.selectAll(".phase.phase-"+i)
					.attr("x",function(v){return (v.x+d.rx)+"px"})
					.attr("width",function(v){return (v.width-d.rx)+"px"})
			}
		})
		.on("dragend",function(d,i) {
			for(i=0;i<_this.phases.length;i++) {
				var phase=_this.phases[i];
				if(moveDirection=="none") {
					phase.x+=phase.dx;
					var newStart=Math.round(timeToCoordinate.invert(phase.x));
					phase.end=newStart+phase.end-phase.start
					phase.start=newStart
				}
				if (moveDirection=="right")
					phase.end=Math.round(timeToCoordinate.invert(phase.x+phase.width+phase.dx))+1
				if (moveDirection=="left")
					phase.start=Math.round(timeToCoordinate.invert(phase.x+phase.dx))
				phase.dx=0;
			}
			_this.draw();
		});

	var reorderPhases=function() {
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

	var calcCoordinates=function() {
		for(i=0;i<_this.phases.length;i++) {
			var phase=_this.phases[i];
			phase.x=timeToCoordinate(phase.start);
			phase.textx=timeToCoordinate((phase.start+phase.end-1)/2);
			phase.width=timeToCoordinate(phase.end-phase.start);
			phase.y=_this.style.phasesY+i*_this.style.phasesHeight;
			phase.texty=_this.style.phasesY+17+i*_this.style.phasesHeight;
			_this.phases[i]=phase;
		}
	}

	var updatePhases=function() {
		var phases=_this.mainElement.selectAll("rect.phase")
			.data(_this.phases);

		phases.enter()
			.append("rect")
			.attr("class",function(v,i){return "phase phase-"+i})
			.attr("fill",_this.style.phasesColor)
			.attr("height",_this.style.phasesHeight+"px")
			.attr("y",function(v){return v.y+"px"})
			/*
			.on("mouseover",function(v,i){
				d3.select(this).attr("class",function(v,i){return "phase phase-"+i+" stretch"})
			})
			*/

		phases
			.attr("width",function(v){return v.width+"px"})
			.attr("transform","translate("+[0,0]+")")
			.attr("x",function(v){return v.x+"px"})
			.attr("y",function(v){return v.y+"px"})
			.call(drag);
	}

	var updateDescriptions=function() {
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

	this.draw=function() {
		reorderPhases();
		calcCoordinates();
		updatePhases();
		updateDescriptions();
		return this;
	}

	this.phases=[];
}

gantplanning.createPlanning=function(planning) {
	return new Planning();
}

this.gantplanning=gantplanning;
}()
