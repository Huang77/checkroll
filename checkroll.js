var selectCourse = "all";
var allAttend = 0, allAbsent = 0;
var selectAttend = "none";

var courseData;
var stuInfo;
var stuCourseInfo;

// main function
function createCheckRoll (data) {
	//alert("Hello World!");
	clearCurrentPage();
	addNewDivs();
	
	courseData = getCourseStatData(data);
	stuInfo = getStuInfo(data);
	stuCourseInfo = getStuCourseInfo(data);
	
	drawLeftPart(courseData);
	drawRightPart(stuInfo, stuCourseInfo);


}

// clear current html page
function clearCurrentPage () {
	var selectImg = document.getElementById("selectFileImage");
	selectImg.parentNode.removeChild(selectImg);
	var logoImg = document.getElementById("logoImage");
	logoImg.parentNode.removeChild(logoImg);
	var uploadFile = document.getElementById("uploadFile");
	uploadFile.parentNode.removeChild(uploadFile);
} 

// add new divs into the page
function addNewDivs () {
	// add the divs to the left part
	var leftPart = document.createElement("div");
	leftPart.id = "leftPart"
	document.body.appendChild(leftPart);
	// add the title div, which is the "checkroll" logo
	var titleDiv = document.createElement("div");
	titleDiv.id = "leftTitle";
	titleDiv.innerHTML = "<img width='320' src='title.png'></img>";
	leftPart.appendChild(titleDiv);
	// add the course div, which is the calendar
	var courseDiv = document.createElement("div");
	courseDiv.id = "courseDiv";
	leftPart.appendChild(courseDiv);
	// add the pie chart div
	var piechartDiv = document.createElement("div");
	piechartDiv.id = "piechartDiv";
	leftPart.appendChild(piechartDiv);
	// add the search div
	var searchDiv = document.createElement("div");
	searchDiv.id = "searchDiv";
	leftPart.appendChild(searchDiv);


	// add the divs to the right part
	var rightPart = document.createElement("div");
	rightPart.id = "rightPart";
	document.body.appendChild(rightPart);
	// add the div for drawing svg
	var stuDiv = document.createElement("div");
	stuDiv.id = "stuDiv";
	rightPart.appendChild(stuDiv);
}

// draw left part of the page
function drawLeftPart (courseData) {
	drawCourseDiagram(courseData);
	allAttend = 0, allAbsent = 0;
	for (var i = 0; i < courseData.length; i++) {
		allAttend += courseData[i].attend;
		allAbsent += courseData[i].absent;
	}
	drawPieChart([allAttend, allAbsent]);

}

function drawCourseDiagram (courseData) {
	
	var margin = {
		top: 50,
		right: 0,
		bottom: 20,
		left: 20
	};
	var temp = d3.extent(courseData, function (d) {
		return d.attend;
	});
	var opacityScale = d3.scale.linear().domain(temp).range([0, 1]);
	var width = document.getElementById("leftPart").clientWidth - margin.left - margin.right;
	var height = 250 - margin.top - margin.bottom;
	//var cellSize = Math.round(width / 8);
	var cellSize = 35;
	var svg = d3.select("#courseDiv").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.selectAll(".course")
		.data(courseData)
		.enter()
		.append("rect")
		.attr("class", "course")
		.attr("x", function (d, i) {
			if (i == 0 || i == 1) {
				return cellSize * 6 + i * cellSize;
			} else {
				return ((i - 2) % 8) * cellSize;
			}
		})
		.attr("y", function (d, i) {
			if (i == 0 || i == 1) {
				return 0;
			} else {
				return Math.floor((i - 2) / 8) * cellSize + cellSize;
			}
		})
		.attr("width", cellSize)
		.attr("height", cellSize)
		.attr("fill-opacity", function (d, i) {
			return opacityScale(d.attend);
		})
		.attr("fill", "#00b9ee")
		.attr("stroke", "#fff")
		.attr("stroke-width", 3)
		.on("mouseover", function (d, i) {
			if (selectCourse == "all") {
				d3.select(this).attr("fill", "#f7d718");
				d3.select(this).attr("fill-opacity", 1);
				changePieChart([d.attend, d.absent]);
			}
		})
		.on("mouseout", function () {
			if (selectCourse == "all") {
				d3.select(this).attr("fill", "#00b9ee");
				d3.select(this).attr("fill-opacity", function (d, i) {
					return opacityScale(d.attend);
				});
				changePieChart([allAttend, allAbsent]);	
			}
		})
		.on("click", function (d, i) {
			if (selectCourse == "all") {
				d3.select(this).attr("fill", "#f7d718").attr("fill-opacity", 1);
				changePieChart([d.attend, d.absent]);	
				selectCourse = i;
				// highlight the selected class of the students
				d3.selectAll(".cCell").transition().duration(1500).attr("fill-opacity", 0.1);
				d3.selectAll(".courseCell" + i).transition().duration(1500).attr("fill-opacity", 1);
			} else {
				d3.select(this).attr("fill", "#00b9ee")
					.attr("fill-opacity", function (d, i) {
						return opacityScale(d.attend);
					});
				changePieChart([allAttend, allAbsent]);
				selectCourse = "all";
				d3.selectAll(".cCell").transition().duration(1500).attr("fill-opacity", 1);
			}

		})
}

// draw pie chart
function drawPieChart (dataArray) {

	var margin  ={
		top: 20,
		right: 20,
		bottom: 20,
		left: 0
	};
	var width = document.getElementById("leftPart").clientWidth - margin.left - margin.right;
	var height = 300 - margin.top - margin.bottom;
	var radius = Math.min(width, height) / 2;
	var svg = d3.select("#piechartDiv").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("class", "slices")
				.attr("transform", "translate(" + (margin.left/2 + width / 2) + "," + (margin.top/2 + height / 2) + ")");

	var color = d3.scale.ordinal().range(["#00b9ee", "#fff"]).domain([0, 1]);
	var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
	var pie = d3.layout.pie()
				.sort(null)
				.value(function (d) {
					return d;
				});
	var g = svg.selectAll(".arc")
			   .data(pie(dataArray))
			   .enter()
			   .append("g")
			   .attr("class", "arc");
	g.append("path")
		.attr("d", arc)
		.attr("class", "slice")
		.style("fill", function (d, i) {
			return color(i);
		})
		.attr("stroke-width", 3)
		.attr("stroke", "#fff")
		.on("mouseover", function (d, i) {
			if (selectAttend == "none") {
				d3.select(this).style("fill", "#f7d718");	
			}
			// highlight the attend students
			var str = "Y";
			if (i == 1) {
				str = "N";
			}
			if (selectCourse != "all") {
				for (var j = 0; j < stuCourseInfo.length; j++) {
					if (stuCourseInfo[j][selectCourse] == str) {
						d3.selectAll("sRect" + j).attr("stroke", "#00b9ee").attr("stroke-width", 3);
					}
				} 
			}

			
		})
		.on("mouseout", function (d, i) {
			var c = color(i);
			if (selectAttend === "none") {
				d3.select(this).style("fill", c);
			}
		})
		.on("click", function (d, i) {
			if (selectAttend == "none") {
				d3.select(this).style("fill", "#f7d718");
				if (i == 0) {
					selectAttend = "Attend";
				} else if (i == 1) {
					selectAttend = "Absent";
				}	
			} else {
				var c = color(i);
				d3.select(this).style("fill", c);
				selectAttend = "none";
			}
			
		});
}

function changePieChart (newData) {
	var margin  ={
		top: 20,
		right: 20,
		bottom: 20,
		left: 20
	};
	var width = document.getElementById("leftPart").clientWidth - margin.left - margin.right;
	var height = 300 - margin.top - margin.bottom;
	var radius = Math.min(width, height) / 2;
	var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
	var pie = d3.layout.pie().sort(null)
				.value(function (d) {
					return d;
				});
	var slice = d3.select(".slices").selectAll(".arc path")
					.data(pie(newData))
					.attr("d", arc)
					.transition().duration(1000)
					.attrTween("d", function (d) {
						this._current = this._current || d;
						var interpolate = d3.interpolate(this._current, d);
						this._current = interpolate(0);
						return function (t) {
							return arc(interpolate(t));
						};
					});
}

// draw right part of the page
function drawRightPart (stuInfo, stuCourseInfo) {
	drawStuCourseInfo(stuCourseInfo);
}

function drawStuCourseInfo (stuCourseInfo) {
	var margin = {
		top: 50,
		right: 0,
		bottom: 20,
		left: 40
	};
	var cellSize = 10, strokeSize = 1;
	var gap = 25, 
		eachWidth = (cellSize) * 8,
		eachHeight = (cellSize) * 5;

	var width = document.getElementById("rightPart").clientWidth - margin.left - margin.right;
	var height = 800 - margin.top - margin.bottom;
	//var cellSize = Math.round(width / 8);

	var svg = d3.select("#stuDiv").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.selectAll(".stuCourse")
		.data(stuCourseInfo)
		.enter()
		.append("g")
		.attr("class", "stuCourse")
		.attr("transform", function (d, i) {
			var x, y;
			x = (i % 10) * (eachWidth + gap);
			y = Math.floor(i / 10) * (eachHeight + gap);
			return "translate(" + x + "," + y + ")"; 
		})
		.each(drawSingleStuCourse)
		.on("click", function (d, i) {
			/*var attend = 0, absent = 0;
			for (var j = 0; j < d.length; j++) {
				if (d[j]== "Y") {
					attend++;
				} else {
					absent++;
				}
			}
			changePieChart([attend, absent]);*/
			var thisRect = d3.select(this).select(".stuRect");
			if (thisRect.attr("stroke") == "#00b9ee") {
				thisRect.attr("stroke-width", 2).attr("stroke", "#e1e1e1");
			} else {
				d3.selectAll(".stuRect").attr("stroke-width", 2).attr("stroke", "#e1e1e1");
				thisRect.attr("stroke", "#00b9ee").attr("stroke-width", 3);
			}
			

		});

}
function drawSingleStuCourse (data, index) {
	var color = d3.scale.ordinal().range(["#33cc99","#ed7f5a"]).domain(["Y", "N"]);
	var cellSize = 10, strokeSize = 1;
	var eachStu = d3.select(this).selectAll(".courseCell")
					.data(data)
					.enter()
					.append("rect")
					.attr("class", function (d, i) {
						return "cCell courseCell" + i;
					})
					.attr("x", function (d, i) {
						if (i == 0 || i == 1) {
							return cellSize * 6 + i * cellSize;
						} else {
							return ((i - 2) % 8) * cellSize;
						}
					})
					.attr("y", function (d, i) {
						if (i == 0 || i == 1) {
							return 0;
						} else {
							return Math.floor((i - 2) / 8) * cellSize + cellSize;
						}
					})
					.attr("width", cellSize)
					.attr("height", cellSize)
					.attr("fill", function (d, i) {
						return color(d);
					})
					.attr("stroke-width", strokeSize)
					.attr("stroke", "#fff");
	d3.select(this).append("rect")
		   .attr("class", function (d, i) {
		   		return "stuRect sRect" + index;
		   })
		   .attr("x", -6)
		   .attr("y", -6)
		   .attr("width", (cellSize) * 8 + 12)
		   .attr("height", (cellSize) * 5 + 12)
		   .attr("stroke-width", 2)
		   .attr("stroke", "#e1e1e1")
		   .attr("fill", "none");

    d3.select(this).append("rect")
    		.attr("x", 0)
    		.attr("y", -10)
    		.attr("width", 40)
    		.attr("height", 20)
    		.attr("fill", "#fff");
    d3.select(this).append("text")
    		.attr("class", "stuName")
    		.attr("x", 20)
    		.attr("y", -2)
    		.text(function (d, i) {
    			return stuInfo[index].Name;
    		})
    		.attr("text-anchor","middle")
    		.attr("fill", "#adadad");
}

// function to filter the student infomation data
function getStuInfo (data) {
	var stuInfo = [];
	for (var i = 0; i < data.length; i++) {
		var stu = {};
		stu.Index = data[i].Index;
		stu.stuId = data[i].stuId;
		stu.Name = data[i].Name;
		stu.Major = data[i].Major;
		stuInfo.push(stu);
	}
	return stuInfo;
}

function getStuCourseInfo (data) {
	var stuCourseInfo = [];
	for (var i = 0; i < data.length; i++) {
		var stuC = [];
		for (var j = 1; j <= 32; j++) {
			stuC.push(data[i]["C" + j]);
		}
		stuCourseInfo.push(stuC);
	}
	return stuCourseInfo;
}

// function to calculate the statistic data of each course
function getCourseStatData (data) {
	var course = [];
	for (var i = 1; i <= 32; i++) {
		var c = {};
		c.attend = 0;
		c.absent = 0;
		course.push(c);
	}
	for (var i = 0; i < data.length; i++) {
		for (var j = 1; j <= 32; j++) {
			if (data[i]["C" + j] === "Y") {
				course[j - 1].attend++;
			} else if (data[i]["C" + j] === "N") {
				course[j - 1].absent++;
			}
		}
	}
	return course;
}