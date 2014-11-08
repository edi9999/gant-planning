!function() {

var gantplanning={
	version:"0.1.0"
};

var Planning=function(modeArg)
{
	var currentMoveDirection=undefined;
	var _this=this;
	var timeToCoordinate;
	var dragged;
	if (typeof modeArg==="undefined")
		modeArg="planning"
	var mode=modeArg;
	var idCount=0;
	var selectedPhase=null;

	var idGetter=function(p){
		return p.__id;
	};

	this.style={
		phaseColor:d3.rgb("#083968"),
		phaseSelectedColor:d3.rgb("#333"),
		stepWidth:"auto",
		phaseHeight:35,
		textColor:d3.rgb("#F7F7F7"),
		phaseY:30,
		svgWidth:700,
		fontsize:16,
		offsetTextY:21,
		weekColor:d3.rgb("#083968"),
		weekBarColor:d3.rgb("#999999")
	};

	this.params={
		sticky:0.1,
		minWeeks:4,
		border:0.3,
		week:"S",
		getPhase:"What should the name of this phase be ?",
		showWeeks:true,
		durationTime:200
	}

	var calcTimeToCoordinate=function()
	{
		if (_this.style.stepWidth=="auto")
			timeToCoordinate=d3.scale.linear()
				.domain([0,_this.weeks])
				.range([0,_this.style.svgWidth])
		else
			timeToCoordinate = d3.scale.linear()
				.domain([0,1])
				.range([0,_this.style.stepWidth]);
	}

	var cleanPhase=function(phase) {
		phase.dx=0;
		phase.dy=0;
		phase.__id=idCount++;
		return phase;
	}

	var detectMoveDirection=function(xleft,width){
		if (Math.abs(xleft)<_this.params.border*timeToCoordinate(1)) {
				return "left";
			}
		var xright=xleft-width;

		if (Math.abs(xright)<_this.params.border*timeToCoordinate(1)) {
				return "right";
			}
		return "none";
	}

	var getMaxWeek=function()
	{
		var max=_this.phases[0].end;
		_this.phases.forEach(function(phase){
			max=Math.max(max,phase.end);
		});
		return max;
	};

	var drag = d3.behavior.drag()
		.on("dragstart", function(d,i) {
			if (mode!='planning') return;
			var type=d3.event.sourceEvent.target.nodeName;
			var xleft = d3.event.sourceEvent.offsetX==undefined?d3.event.sourceEvent.layerX:d3.event.sourceEvent.offsetX;
			xleft-=d.x;
			if (type=="text")
				currentMoveDirection="none";
			else
				currentMoveDirection=detectMoveDirection(xleft,d.width);
			dragged=false;
		})
		.on("drag", function(d,i) {
			if (mode!='planning') return;
			dragged=true;
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

			if (currentMoveDirection=="none") {
				if(d.start+timeToCoordinate.invert(d.rx)<=0)
					d.rx=-timeToCoordinate(d.start);
				_this.mainElement.selectAll(".phase.phase-"+d.__id)
					.attr("x",function(v){return (v.x+d.rx)})
				_this.mainElement.selectAll(".phase-description.phase-"+d.__id)
					.attr("x",function(v){return (v.textx+d.rx)})
			}

			if (currentMoveDirection=="right") {
				if (d.end-d.start+timeToCoordinate.invert(d.rx)<=1) {
					d.rx=timeToCoordinate(d.start-d.end+1);
				}
				_this.mainElement.selectAll(".phase.phase-"+d.__id)
					.attr("width",function(v){return (v.width+d.rx)+"px"})
				_this.mainElement.selectAll(".phase-description.phase-"+d.__id)
					.attr("x",function(v){return (v.textx+d.rx/2)+"px"})
			}
			if (currentMoveDirection=="left") {
				if (d.end-d.start-timeToCoordinate.invert(d.rx)<=1) {
					d.rx=timeToCoordinate(d.end-d.start-1);
				}
				_this.mainElement.selectAll(".phase-description.phase-"+d.__id)
					.attr("x",function(v){return (v.textx+d.rx/2)+"px"})
				_this.mainElement.selectAll(".phase.phase-"+d.__id)
					.attr("x",function(v){return (v.x+d.rx)+"px"})
					.attr("width",function(v){return (v.width-d.rx)+"px"})
			}
		})
		.on("dragend",function(d,i) {
			if (mode!='planning') return;
			if (dragged==false)
			{
				return true;
			}
			for(i=0;i<_this.phases.length;i++) {
				var phase=_this.phases[i];
				if (phase.dx!=0)
				{
					if(currentMoveDirection=="none") {
						phase.x+=phase.rx;
						var newStart=Math.round(timeToCoordinate.invert(phase.x));
						phase.end=newStart+phase.end-phase.start;
						phase.start=newStart;
						currentMoveDirection=undefined;
					}
					if (currentMoveDirection=="right") {
						phase.end=Math.round(timeToCoordinate.invert(phase.x+phase.width+phase.rx));
						if (phase.end<phase.start+1) phase.end=phase.start+1;
						currentMoveDirection=undefined;
					}
					if (currentMoveDirection=="left") {
						phase.start=Math.round(timeToCoordinate.invert(phase.x+phase.rx));
						if (phase.start>phase.end-1) phase.start=phase.end-1;
						currentMoveDirection=undefined;
					}
				}
				phase.dx=0;
				phase.rx=0;
			}
			_this.selectPhase(d.__id);
			_this.setWeeks(getMaxWeek());
			_this.drawWeeks();
			_this.draw();
			currentMoveDirection=undefined;
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
	};

	var calcCoordinates=function() {
		for(i=0;i<_this.phases.length;i++) {
			var phase=_this.phases[i];
			phase.y=_this.style.phaseY+i*_this.style.phaseHeight;
			phase.texty=_this.style.phaseY+_this.style.offsetTextY+i*_this.style.phaseHeight;
			if (mode==='planning') phase=calcCoordinatesPhasePlanningMode(phase);
			if (mode==='budget') phase=calcCoordinatesPhaseBudgetMode(phase);
			_this.phases[i]=phase;
		}
	}

	var calcCoordinatesPhasePlanningMode=function(phase) {
		phase.x=timeToCoordinate(phase.start);
		phase.textx=timeToCoordinate((phase.start+phase.end)/2);
		phase.width=timeToCoordinate(phase.end-phase.start);
		return phase;
	}

	var calcCoordinatesPhaseBudgetMode=function(phase) {
		phase.x=0;
		phase.textx=timeToCoordinate(1);
		phase.width=timeToCoordinate(2);
		return phase;
	}

	var getPhases=function(){
		return _this
			.mainElement
			.selectAll("rect.phase");
	}

	var drawPhases=function() {
		var phases=getPhases()
			.data(_this.phases,idGetter);

		phases.enter()
			.append("rect")
			.attr("class",function(v,i){return "phase phase-"+v.__id})
			.attr("height",_this.style.phaseHeight+"px")
			.attr("x",function(v){return v.x+"px"})
			.attr("y",function(v){return v.y+"px"})
			.on("mousemove",function(d,i){
				var type=d3.event.target.nodeName;
				var xleft = d3.event.offsetX==undefined?d3.event.layerX:d3.event.offsetX;
				if (type=="rect")
					xleft-=d.x;
				if (type=="text")
					xleft-=d.x;
				if (currentMoveDirection==undefined)
					var moveDirection=detectMoveDirection(xleft,d.width)
				else
					var moveDirection=currentMoveDirection;
				d3.select(this)
					.attr("class",function(v){return "phase phase-"+v.__id+" stretch-"+moveDirection})
			});

		phases
			.attr("fill",function(v){
				if (v.__id===selectedPhase) return _this.style.phaseSelectedColor;
				return _this.style.phaseColor;
			})
			.on("click",function(d){
				d3.event.stopPropagation()
				if (dragged) return;
				_this.selectPhase(d.__id)
			})
			.call(drag)

		phases
			.transition()
			.duration(_this.params.durationTime)
			.attr("width",function(v){return v.width+"px"})
			.attr("x",function(v){return v.x+"px"})
			.attr("y",function(v){return v.y+"px"})
	}

	var getPhasesDescriptions=function(){
		return _this.mainElement.selectAll("text.phase-description");
	}

	var drawDescriptions=function() {
		var descriptions=getPhasesDescriptions()
			.data(_this.phases,idGetter);

		descriptions.enter()
			.append("text")
			.attr("class",function(v,i){return "phase-description phase-"+v.__id})
			.attr("text-anchor","middle")
			.attr("font-size",_this.style.fontsize)
			.attr("fill",_this.style.textColor)
			.attr("x",function(v,i){return v.textx+"px"})
			.attr("y",function(v,i){return v.texty+"px"})
			.on("mousemove",function(d,i){
				if (currentMoveDirection==undefined)
					var moveDirection="none";
				else
					var moveDirection=currentMoveDirection;
				d3.select(this)
					.attr("class",function(v){return "phase-description phase-"+v.__id+" stretch-"+moveDirection})
			});

		descriptions
			.text(function(d){return d.description})
			.on("click",function(d){
				d3.event.stopPropagation()
				if (dragged) return;
				_this.selectPhase(d.__id)
			})
			.call(drag)

		descriptions.transition().duration(_this.params.durationTime)
			.attr("x",function(v,i){return v.textx+"px"})
			.attr("y",function(v,i){return v.texty+"px"})
	}

	this.selectPhase=function(id){
		selectedPhase=id;
		this.draw();
	}

	this.setStepWidth=function(stepWidth) {
		this.style.stepWidth=stepWidth;
		calcTimeToCoordinate();
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
		this.selectPhase(phase.__id)
	}

	this.setMode=function(m){
		if (m!=='budget' && m!=='planning') return;
		mode=m;
		this.draw();
		return this;
	}

	this.attachTo=function(element) {
		this.element=element;
		this.mainElement= d3.select(this.element)
			.attr("class","gant-planning");

		this.mainElement.on('click',function () {
			_this.selectPhase(null);
		})
		return this;
	}

	this.setWeeks=function(n)
	{
		if (n===undefined) n=0;
		this.weeks=Math.max(n,this.params.minWeeks);
		calcTimeToCoordinate();
	}

	var getWeekDescriptions=function(){
		return _this.mainElement.selectAll("text.week-description");
	}
	var getWeekBars=function(){
		return _this.mainElement.selectAll("rect.week-bars");
	}

	var drawWeekDescriptions=function(){
		var weeks=Array.apply(null, {length: _this.weeks}).map(Number.call, Number);
		var weekDescriptions=getWeekDescriptions()
			.data(weeks);

		weekDescriptions.enter().append("text")
			.attr("class","week-description");

		weekDescriptions
			.attr("text-anchor","middle")
			.attr("font-size",_this.style.fontsize)
			.attr("fill",_this.style.weekColor)
			.attr("y",17)
			.attr("x",function(w){return timeToCoordinate(w+0.5);})
			.text(function(d){return _this.params.week+" "+(d+1)});

		weekDescriptions.exit().remove();
	}

	var drawWeekBars=function(){
		var weeksForBars=Array.apply(null, {length: _this.weeks+1}).map(Number.call, Number);

		var weekBars=getWeekBars()
			.data(weeksForBars);

		weekBars.enter().append("rect")
			.attr("class","week-bars");

		weekBars
			.attr("width",2)
			.attr("height",12)
			.attr("y",12)
			.attr("x",function(w){return timeToCoordinate(w);})
			.attr("fill",_this.style.weekBarColor);

		weekBars.exit().remove();
	}

	this.drawWeeks=function()
	{
		drawWeekBars();
		drawWeekDescriptions();
	}

	this.clearWeeks=function(){
		getWeekBars().remove();
		getWeekDescriptions().remove();
	};

	var addModeClass=function(){
		_this.mainElement
			.attr("class","gant-planning "+"mode-"+mode);
	}

	this.draw=function() {
		addModeClass();
		reorderPhases();
		if (this.params.showWeeks==true) {
			if (mode=='planning')
				this.setWeeks(getMaxWeek());
			if (mode=='budget')
				this.setWeeks(2);
		}
		calcTimeToCoordinate();
		if (this.params.showWeeks==true) {
			if (mode=='planning')
				this.drawWeeks();
			if (mode=='budget')
				this.clearWeeks();
		}
		calcCoordinates();
		drawPhases();
		drawDescriptions();
		return this;
	}

	dragged=false;
	this.phases=[];
}

gantplanning.createPlanning=function(planning) {
	return new Planning();
}

this.gantplanning=gantplanning;
}()
