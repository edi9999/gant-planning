gant-planning
=============

D3js based planning editor. 

Features:

 * Drag and drop to move/resize phases
 * Click to edit a phase description


# [Demo Page](http://javascript-ninja.fr/planning/)

![Demo Image](demo.png)

### HTML:

	<svg id="demo"></svg>

### JS:
```
var planning=gantplanning
	.createPlanning()
	.fill([
		{"description":"First Phase","start":0,"end":2},
		{"description":"Second Phase","start":3,"end":6}
	])
	.attachTo(document.getElementById('demo'))
	.draw();
```
