//needs primitives.js
/*global CreatePoint:false */
//returns true if a point is inside a particular polygon
function PointInPolygon(poly, x, y){
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) 
        ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y)) &&
        (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) &&
        (c = !c);
    if (c === true) 
        return true;
    else 
        return false;
}

//a polygon simplification algorithm I wrote 2 years ago based on a tolerance value 
function Simplify(polygon, tolerance){
    var simplefiedPolygon = [];
    
    simplefiedPolygon[0] = polygon[0];
    
    var ivertex = 0;
    var ipoint = 0;
    
    for (var c = 0; c < polygon.length - 2; c++) {
        var point1 = [];
        
        point1 = {
            x: polygon[ivertex].x,
            y: polygon[ivertex].y
        };
        
        var point2 = [];
        point2 = {
            x: polygon[c + 2].x,
            y: polygon[c + 2].y
        };
        
        var MidPoints = [];
        
        for (var j = 0; j < (c + 1 - ivertex); j++) {
            MidPoints[j] = polygon[ivertex + j + 1];
        }
        
        var D = Math.sqrt(Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2));
        var y1my2 = (point1.y - point2.y);
        var x2mx1 = (point2.x - point1.x);
        var C = (point2.y * point1.x) - (point1.y * point2.x);
        
        var run = 1;
        
        for (var i = 0; i < MidPoints.length; i++) {
            var dist = Math.abs(MidPoints[i].x * y1my2 + MidPoints[i].y * x2mx1 + C) / D;
            if (dist > tolerance) {
                run = -1;
            }
        }
        
        if (run == -1) {
            ipoint++;
            ivertex = c + 1;
            simplefiedPolygon[ipoint] = polygon[c + 1];
        }
    }
    simplefiedPolygon[ipoint + 1] = polygon[polygon.length - 2];
    simplefiedPolygon[ipoint + 2] = polygon[polygon.length - 1];
    
    return simplefiedPolygon;
}
// get the intersection of 2 lines
function intersection(PointA, PointB, PointC, PointD){
    var cross;
    
    var xD1 = PointB.x - PointA.x;
    var xD2 = PointD.x - PointC.x;
    var yD1 = PointB.y - PointA.y;
    var yD2 = PointD.y - PointC.y;
    var xD3 = PointA.x - PointC.x;
    var yD3 = PointA.y - PointC.y;
    
    var len1 = Math.sqrt(Math.pow(xD1, 2) + Math.pow(yD1, 2));
    var len2 = Math.sqrt(Math.pow(xD2, 2) + Math.pow(yD2, 2));
    
    var dot = (xD1 * xD2 + yD1 * yD2); // dot product  
    var deg = dot / (len1 * len2);
    
    var div = yD2 * xD1 - xD2 * yD1;
    var ua = (xD2 * yD3 - yD2 * xD3) / div;
    var ub = (xD1 * yD3 - yD1 * xD3) / div;
    
    var crossx = PointA.x + ua * xD1;
    var crossy = PointA.y + ua * yD1;
    
    cross = CreatePoint(crossx,crossy);
    
    return cross;
}
// checks if the intersection point from the previous function is within certain line segments
function IsIntersectionWithinLineLimits(PointA, PointB, PointC, PointD, cross){
    if (cross.x >= PointC.x && cross.x <= PointD.x && cross.x >= PointA.x && cross.x <= PointB.x) {
        if (cross.y >= PointC.y && cross.y <= PointD.y || cross.y <= PointC.y && cross.y >= PointD.y) {
            return true;
        }
    }
    if (cross.x <= PointC.x && cross.x >= PointD.x && cross.x <= PointA.x && cross.x >= PointB.x) {
        if (cross.y >= PointC.y && cross.y <= PointD.y || cross.y <= PointC.y && cross.y >= PointD.y) {
            return true;
        }
    }
    return false;
}
//simple 2D distance function
function distance(PointA, PointB){
    return Math.sqrt(Math.pow(PointB.x - PointA.x, 2) + Math.pow(PointB.y - PointA.y, 2));
}

//scale and offset
function transform(oldGeometries, Boxobj, width, height){
    var TransformedGeometries = [];
    
    var lw = Boxobj.Xmax - Boxobj.Xmin;
	var ly = Boxobj.Ymax - Boxobj.Ymin;
    
    if (lw < ly) {
        lw = lw;
    }
    else {
        lw = ly;
    }
	
    if (width < height) {
		width = width;
    }
    else {
        width = height;
    }
    
    for (var i = 0; i < oldGeometries.length; i++) {
        var Geometries = [];

		if (oldGeometries[i].type == "point") {
			Geometries = {
				x: parseFloat(((oldGeometries[i].geometry.x - Boxobj.Xmin) / lw) * width),
				y: parseFloat(height - ((oldGeometries[i].geometry.y - Boxobj.Ymin) / lw) * width)
			};
		}
		else {
			for (var j = 0; j < oldGeometries[i].geometry.length; j++) {
				Geometries[j] = {
					x: parseFloat(((oldGeometries[i].geometry[j].x - Boxobj.Xmin) / lw) * width),
					y: parseFloat(height - ((oldGeometries[i].geometry[j].y - Boxobj.Ymin) / lw) * width)
				};
			}
		}
        TransformedGeometries[i] = {
            type: oldGeometries[i].type,
            geometry: Geometries
        };
    }
    return TransformedGeometries;
}

//get the bounding box of a geometry
function getBoundingBox(Geometries)
{
	var alllinesx = [];
	var alllinesy = [];
	var p = 0;
	for (var i = 1; i < Geometries.length; i++) {
	
		for (var j = 0; j < Geometries[i].geometry.length; j++) {
			alllinesx[p] = parseFloat(Geometries[i].geometry[j].x);
			alllinesy[p] = parseFloat(Geometries[i].geometry[j].y);
			p++;
		}
	}
	
	var BBox = {
		Xmin: Math.min.apply(null, alllinesx),
		Xmax: Math.max.apply(null, alllinesx),
		Ymin: Math.min.apply(null, alllinesy),
		Ymax: Math.max.apply(null, alllinesy)
	};
	return BBox;
}

//get the area of a polygon
function GetArea(Polygon)
{
	var area = 0;
	
	for (var i=0; i < Polygon.length-1; i++)
	{
		area = area + Polygon[i].x*Polygon[i+1].y-Polygon[i+1].x*Polygon[i].y;
	}
	return area*0.5;
}

//gets the centroid of a polygon
function GetCentroid(Polygon)
{
	var Centroid = [];
	var cx = 0;
	var cy =0;
	for (var i=0; i < Polygon.length-1; i++)
	{
		cx = cx +(Polygon[i].x+Polygon[i+1].x)*(Polygon[i].x*Polygon[i+1].y-Polygon[i+1].x*Polygon[i].y);
		cy = cy +(Polygon[i].y+Polygon[i+1].y)*(Polygon[i].x*Polygon[i+1].y-Polygon[i+1].x*Polygon[i].y);
	}
	cx = 1/(6*GetArea(Polygon))*cx;
	cy = 1/(6*GetArea(Polygon))*cy;
	Centroid = {x:cx,y:cy};
	return Centroid;
}

//extends a line segments equally from both sides
function extendLineBothSides(PointA, PointB, dist)
{
	var slope = (PointB.y-PointA.y)/ (PointB.x-PointA.x);
	var intercept = PointA.y-PointA.x*slope;
	
	var a,b,c,d;
	
	var result = [];
	if (PointA.x > PointB.x) {
		a = parseFloat(PointA.x)+dist;
		b = slope * (a)+intercept;
		c = parseFloat(PointB.x)-dist;
		d = slope * (c)+intercept;
	}
	else
	{
		a = parseFloat(PointB.x)+dist;
		b = slope * (a)+intercept;
		c = parseFloat(PointA.x)-dist;
		d = slope * (c)+intercept;
	}
	result[0] = CreatePoint(a,b);
	result[1] = CreatePoint(c,d);
	
	return result;
}

//gets a list of nodes from a polygon geometry
function getPolygonNodes(Polygon)
{
	var nodes = [];
		for (var i=0; i < Polygon.length; i++)
	{
		var point = CreatePoint(Polygon[i].x, Polygon[i].y);
		nodes[i] = {type: "point", geometry: point};
	}
	
	return nodes;
}
//gets a list of nodes from a geometry collection
function getAllNodes(Geometries)
{
	var nodes = [];
	
	var p = 0;
		for (var i = 0; i < Geometries.length; i++) {
		if (Geometries.type != "point") {
			for (var j = 0; j < Geometries[i].geometry.length; j++) {
				var point = CreatePoint(Geometries[i].geometry[j].x, Geometries[i].geometry[j].y);
				nodes[p] = {type: "point", geometry: point};
				p++;
			}
		}
	}
	return nodes;
}

//Gets the Polar Angle From 2 Points
function PolarAngle(PointA, PointB)
{
 var angle = Math.atan2(PointB.y - PointA.y, PointB.x - PointA.x);
   return angle;
}

//scale and rotate Geometries (not working have to write a bunch of transformation functions) I want to replace scale and offset function above
/*function scaleAndRotateGeometries(Geometries, PointAnchor,  scalex,  scaley,  angle)
{
    var TGeometries = [];
    
    for (var i=0; i < Polygon.length-1; i++)
	{
    }
    
    translate(PointAnchor.x, PointAnchor.y);
    scale(1.0D / scalex, 1.0D / scaley);
    rotate(angle);
    translate(-1.0D * PointAnchor.x, -1.0D * PointAnchor.y);
    transform(Geometries, 0, TGeometries, 0, getAllNodes(Geometries).length);
    
    return TGeometries;
  }*/

//trying stuff
function PointToLine(PointA, PointB, PointPt)
{
var x = PointB.x - PointA.x;
var y = PointB.y - PointA.y;
var len = Math.pow(x, 2) + Math.pow(y, 2);
var dx = x * (PointPt.x - PointA.x) + y * (PointPt.y - PointA.y);

var pp2p = CreatePoint(PointA.x + dx * x / len, PointA.y + dx * y / len);

return pp2p;
}
// three points on same line
function betweenPoints(PointA, PointB, PointC)
{
    var btwPoint = (PointC.x <= Math.max(PointA.x, PointB.x)) && (PointC.x >= Math.min(PointA.x, PointB.x)) && (PointC.y <= Math.max(PointA.y, PointB.y)) && (PointC.y >= Math.min(PointA.y, PointB.y));

     return btwPoint;
 }