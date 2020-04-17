//SSD disc

//document.querySelector("#input-size").oninput = function ()
//{
  //document.querySelector("output[name=output-size]").value = this.value;
//}

function getDiscSize ()
{
  return parseInt(document.querySelector("input[name=input-size]").value);
}

function convertInput (includeDeadlines)
{
  includeDeadlines = includeDeadlines || false;
  discSize = getDiscSize();
  return document.querySelector("#input-data").value.split(",").reduce(function (result, block)
  {
    //if (!isNaN(block) && block <= discSize)
      //result.push(parseInt(block));
    //else {
      //console.log("wrong input: " + block);
    //}
    temp = block.split("/");
    value = parseInt(temp[0]);
    deadline = parseInt(temp[1]);
    if (!isNaN(value) && value <= discSize)
    {
      if (includeDeadlines == false)
        result.push(parseInt(value));
      else {
        row = {value: value, deadline: deadline};
        result.push(row);
      }
    }
    return result;
  }, []);
}

function getStartingPoint()
{
  document.querySelector("#output-movement").innerHTML = "";
  tempValue = parseInt(document.querySelector("#starting-point").value);
  if (tempValue > getDiscSize() || tempValue < 0)
  {
    tempValue = parseInt(getDiscSize()/2);
    document.querySelector("#output-movement").innerHTML += "<p class='error'>Error: Incorrect starting point. Using " + tempValue + " instead.</p>";
  }
  return tempValue;
}

document.querySelector("input[name=randomize]").onclick = function ()
{
  discSize = getDiscSize();
  numberOfElements = parseInt(document.querySelector("input[name=generate-data-size]").value);
  generatedNumbers = []
  for (var i = 0; i < numberOfElements; i++)
  {
    generatedNumbers.push(Math.floor(Math.random() * discSize) + 1);
  }
  console.log(generatedNumbers);
  document.querySelector("textarea[name=input-data]").value = "";
  for (var i = 0; i < generatedNumbers.length; i++)
    document.querySelector("textarea[name=input-data]").value += ","+ generatedNumbers[i] + "/-1";
}

function swapDirection (direction)
{
  return direction == 0 ? 1 : 0;
}

function createChart (points, algorithmName, totalMovement, missedBlocks)
{
  document.querySelector("h2").innerHTML = algorithmName;
  document.querySelector("#output-movement").innerHTML += "Total disk movement: " + totalMovement;
  if (missedBlocks != undefined)
  {
    document.querySelector("#output-movement").innerHTML += "<br /> Missed blocks:";
    for (var i = 0; i < missedBlocks.length; i++)
    {
      document.querySelector("#output-movement").innerHTML += missedBlocks[i].value + ",";
    }
  }
  labels = [];
  for (var i = 0; i < points.length; i++)
    labels.push(i);
  var data = {
    labels: labels,
    series: [points]
  }

  var options = {
    showPoint: true,
    lineSmooth: false,
    height: 500,
    width: 700,
    axisX: {
      showGrid: false,
      showLabel: false
    },
    axisY: {
      onlyInteger: true,
      low: 0,
      high: getDiscSize()
    }
  };
  new Chartist.Line('.ct-chart', data, options);
}

document.querySelector("input[name=FCFS]").onclick = function ()
{
  arrayOfBlocks = convertInput();
  orderOfBlocks = [];
  discSize = getDiscSize();
  currentPoint = getStartingPoint();
  orderOfBlocks.push(currentPoint);
  totalMovement = 0;
  numberOfBlocks = arrayOfBlocks.length;
  for (var i = 0; i < numberOfBlocks; i++)
  {
    currentDistance = Math.abs(currentPoint - arrayOfBlocks[i]);
    totalMovement += currentDistance;
    currentPoint = arrayOfBlocks[i];
    orderOfBlocks.push(currentPoint);
  }
  console.log("Order: " + orderOfBlocks);
  console.log("FCFS: " + totalMovement);
  createChart(orderOfBlocks, "FCFS", totalMovement);
}

document.querySelector("input[name=SSTF]").onclick = function ()
{
  arrayOfBlocks = convertInput();
  orderOfBlocks = [];
  discSize = getDiscSize();
  currentPoint = getStartingPoint();
  orderOfBlocks.push(currentPoint);
  totalMovement = 0;
  numberOfBlocks = arrayOfBlocks.length;
  for (var i = 0; i < numberOfBlocks; i++)
  {
    closestPoint = arrayOfBlocks.reduce(function(prev, curr) { //finds the block closest to currentPoint
      return (Math.abs(curr - currentPoint) < Math.abs(prev - currentPoint) ? curr : prev);
      });
    //console.log(closestPoint);
    currentDistance = Math.abs(currentPoint - closestPoint);
    totalMovement += currentDistance;
    currentPoint = closestPoint;
    arrayOfBlocks.splice(arrayOfBlocks.indexOf(closestPoint), 1);
    orderOfBlocks.push(currentPoint);
  }
  console.log("Order: " + orderOfBlocks);
  console.log("SSTF: " + totalMovement);
  createChart(orderOfBlocks, "SSTF", totalMovement);
}

document.querySelector("input[name=SCAN]").onclick = function ()
{
  arrayOfBlocks = convertInput();
  orderOfBlocks = [];
  discSize = getDiscSize();
  currentPoint = getStartingPoint();
  orderOfBlocks.push(currentPoint);
  totalMovement = 0;
  var tempArray = arrayOfBlocks.filter(function (block)
    {
      return block <= currentPoint;
    })
  tempArray.sort(function (a,b)
    {
      return b-a;
    })
  console.log(tempArray);
  tempSize = tempArray.length;
  for (var i = 0; i < tempSize; i++)
  {
    currentBlock = tempArray[i];
    currentDistance = Math.abs(currentPoint - currentBlock);
    totalMovement += currentDistance;
    currentPoint = currentBlock;
    arrayOfBlocks.splice(arrayOfBlocks.indexOf(currentBlock), 1);
    orderOfBlocks.push(currentPoint);
    console.log("current point: " + currentPoint + " distance: " + totalMovement);
  }
  if(arrayOfBlocks.length != 0)
  {
    totalMovement += currentPoint;
    if (currentPoint != 0) {
      orderOfBlocks.push(0);
      currentPoint = 0;
    }
    arrayOfBlocks.sort(function (a,b)
      {
        return a-b;
      });
    console.log(arrayOfBlocks);
    tempSize = arrayOfBlocks.length;
    for (var i = 0; i < tempSize; i++)
    {
      currentBlock = arrayOfBlocks[i];
      currentDistance = Math.abs(currentPoint - currentBlock);
      totalMovement += currentDistance;
      currentPoint = currentBlock;
      //arrayOfBlocks.splice(arrayOfBlocks.indexOf(currentBlock), 1);
      orderOfBlocks.push(currentPoint);
      console.log("current point: " + currentPoint + " distance: " + totalMovement);
    }
  }
  console.log("Order: " + orderOfBlocks);
  console.log("SCAN: " + totalMovement);
  createChart(orderOfBlocks, "SCAN", totalMovement);
}

document.querySelector("input[name=C-SCAN]").onclick = function ()
{
  arrayOfBlocks = convertInput();
  orderOfBlocks = [];
  discSize = getDiscSize();
  currentPoint = getStartingPoint();
  orderOfBlocks.push(currentPoint);
  totalMovement = 0;
  numberOfBlocks = arrayOfBlocks.length;
  for (var i = 0; i < numberOfBlocks; i++)
  {
    var tempArray = arrayOfBlocks.filter(function (block)
      {
        return block <= currentPoint;
      })
    if (tempArray.length == 0)
    {
      totalMovement += currentPoint + discSize;
      if (currentPoint != 0) {
        orderOfBlocks.push(0);
      }
      currentPoint = discSize;
      orderOfBlocks.push(currentPoint);
      tempArray = arrayOfBlocks.filter(function (block)
        {
          return block <= currentPoint;
        })
    }
    currentBlock = Math.max.apply(Math, tempArray);
    currentDistance = Math.abs(currentPoint - currentBlock);
    totalMovement += currentDistance;
    currentPoint = currentBlock;
    arrayOfBlocks.splice(arrayOfBlocks.indexOf(currentBlock), 1);
    orderOfBlocks.push(currentPoint);
  }
  console.log("Order: " + orderOfBlocks);
  console.log("C-SCAN: " + totalMovement);
  createChart(orderOfBlocks, "C-SCAN", totalMovement);
}
document.querySelector("input[name=EDF]").onclick = function ()
{
  arrayOfBlocks = convertInput(true);
  orderOfBlocks = [];
  missedBlocks = [];
  discSize = getDiscSize();
  currentPoint = getStartingPoint();
  orderOfBlocks.push(currentPoint);
  totalMovement = 0;
  //todo
  blocksWithDeadline = arrayOfBlocks.filter(function (row)
  {
    return row.deadline > 0;
  })
  blocksWithDeadline.sort(function (a,b)
  {
    return a.deadline - b.deadline;
  }
  )
  for (var i = 0; i < blocksWithDeadline.length; i++)
  {
    requiredMovement = Math.abs(blocksWithDeadline[i].value - currentPoint);
    if (totalMovement + requiredMovement > blocksWithDeadline[i].deadline)
    {
      missedBlocks.push(blocksWithDeadline[i]);
    }
    else {
      totalMovement += requiredMovement;
      currentPoint = blocksWithDeadline[i].value;
      orderOfBlocks.push(currentPoint);
    }
    arrayOfBlocks.splice(arrayOfBlocks.indexOf(blocksWithDeadline[i]), 1);
  }
  console.log("after:");
  for (var i = 0; i < arrayOfBlocks.length; i++)
    console.log(arrayOfBlocks[i]);
  simpleArray = [];
  numberOfBlocks = arrayOfBlocks.length;
  for (var i = 0; i < numberOfBlocks; i++)
  {
    simpleArray.push(arrayOfBlocks[i].value);
  }
  console.log(simpleArray, numberOfBlocks);
  for (var i = 0; i < numberOfBlocks; i++)
  {
    closestPoint = simpleArray.reduce(function(prev, curr) { //finds the block closest to currentPoint
      return (Math.abs(curr - currentPoint) < Math.abs(prev - currentPoint) ? curr : prev);
      });
    console.log("closest" + closestPoint);
    currentDistance = Math.abs(currentPoint - closestPoint);
    totalMovement += currentDistance;
    currentPoint = closestPoint;
    simpleArray.splice(simpleArray.indexOf(closestPoint), 1);
    console.log(simpleArray);
    orderOfBlocks.push(currentPoint);
  }
  console.log("missed: "+ missedBlocks);
  console.log(arrayOfBlocks);
  console.log("Order: " + orderOfBlocks);
  console.log("EDF: " + totalMovement);
  createChart(orderOfBlocks, "EDF", totalMovement, missedBlocks);
}
