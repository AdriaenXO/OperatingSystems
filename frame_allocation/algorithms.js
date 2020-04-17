function getNumberOfPages()
{
    return parseInt(document.querySelector("#number-of-pages").value);
}

function getNumberOfFrames()
{
    return parseInt(document.querySelector("#number-of-frames").value);
}

function readInput()
{
    const numberOfPages = getNumberOfPages();
    let process1 = document.querySelector("#input-data1").value.split(',').reduce(
        function (arrayOfBlocks, page)
        {
            if (parseInt(page) < numberOfPages)
                arrayOfBlocks.push(parseInt(page));
            return arrayOfBlocks;
        }, []
    );
    let process2 = document.querySelector("#input-data2").value.split(',').reduce(
        function (arrayOfBlocks, page)
        {
            if (parseInt(page) < numberOfPages)
                arrayOfBlocks.push(parseInt(page));
            return arrayOfBlocks;
        }, []
    );
    return [process1, process2];
}

document.querySelector("input[name=randomize1]").onclick = function ()
{
    const numberOfPages = getNumberOfPages();
    const pagesToGenerate = document.querySelector("#generate-data-size1").value;
    let result = "";
    for (let i = 0; i < pagesToGenerate; i++)
        result += Math.floor(Math.random() * numberOfPages) + ",";
    document.querySelector("#input-data1").value = result;
};

document.querySelector("input[name=randomize2]").onclick = function ()
{
    const numberOfPages = getNumberOfPages();
    const pagesToGenerate = document.querySelector("#generate-data-size2").value;
    let result = "";
    for (let i = 0; i < pagesToGenerate; i++)
        result += Math.floor(Math.random() * numberOfPages) + ",";
    document.querySelector("#input-data2").value = result;
};

function LRU (pagesList, framesNumber)
{
    const numberOfFrames = framesNumber;
    const arrayOfPages = pagesList;
    let arrayOfFrames = [];
    let errorCount = 0;
    let output = arrayOfPages.map(page => {
        if (!arrayOfFrames.includes(page))
        {
            if (arrayOfFrames.length < numberOfFrames)
                arrayOfFrames.push(page);
            else
            {
                arrayOfFrames.shift();
                arrayOfFrames.push(page);
            }
            errorCount++;
            return { framesState: arrayOfFrames.slice(), page, error: true};
        }
        else
        {
            arrayOfFrames.splice(arrayOfFrames.indexOf(page), 1);
            arrayOfFrames.push(page);
            return { framesState: arrayOfFrames.slice(), page, error: false};
        }

    });
    return [errorCount, output];
}

function formatFramesState (framesState, numberOfFrames)
{
    let result = "";
    result += framesState.join(" ");
    const freeSlots = numberOfFrames - framesState.length;
    for (let i = 0; i < freeSlots; i++)
        result += " _";
    return result;
}

function display(algorithm, errorCount1, frames1, output1, errorCount2, frames2, output2)
{
    document.querySelector("#output-info").innerHTML = "";
    document.querySelector("#output h2").innerHTML = algorithm;
    document.querySelector("#error-info").innerHTML = "<p>Errors: " + (errorCount1+errorCount2) + "</p>";
    document.querySelector("#output-info").innerHTML = "Process 1 (" + frames1 + " frames): " + errorCount1 + " errors<br/>Process 2 (" + frames2 + " frames): " + errorCount2 + " errors";
    console.log(output1);
    let result = "<table><thead><tr><th>Page</th><th>Frames state for Process 1</th></tr></thead>";
    output1.forEach(line =>
    {
        if (line.error)
            result += "<tr class='error'>";
        else
            result += "<tr class='ok'>";
        result += "<td>" + line.page + "</td><td>" + formatFramesState(line.framesState, frames1) + "</td>";
        result += "</tr>";
    });
    result += "</table>";
    result += "<table><thead><tr><th>Page</th><th>Frames state for Process 2</th></tr></thead>";
    output2.forEach(line =>
    {
        if (line.error)
            result += "<tr class='error'>";
        else
            result += "<tr class='ok'>";
        result += "<td>" + line.page + "</td><td>" + formatFramesState(line.framesState, frames2) + "</td>";
        result += "</tr>";
    });
    document.querySelector("#output-info").innerHTML += result;

}

document.querySelector("input[name=Equal]").onclick = function ()
{
    let temp = readInput();
    let process1 = temp[0];
    let process2 = temp[1];
    const numberOfFrames = Math.floor(getNumberOfFrames()/2);
    const LRU1 = LRU(process1, numberOfFrames);
    const LRU2 = LRU(process2, numberOfFrames);
    display("Equal", LRU1[0], numberOfFrames, LRU1[1],  LRU2[0], numberOfFrames, LRU2[1]);

};

document.querySelector("input[name=Proportional]").onclick = function ()
{
    let temp = readInput();
    let process1 = temp[0];
    let process2 = temp[1];
    const numberOfFrames = getNumberOfFrames();
    const framesForProcess1 = Math.floor(numberOfFrames * process1.length / (process1.length + process2.length));
    const framesForProcess2 = Math.floor(numberOfFrames * process2.length / (process1.length + process2.length));
    const LRU1 = LRU(process1, framesForProcess1);
    const LRU2 = LRU(process2, framesForProcess2);
    display("Proportional", LRU1[0], framesForProcess1, LRU1[1],  LRU2[0], framesForProcess2, LRU2[1]);
};

document.querySelector("input[name=Random]").onclick = function ()
{
    let temp = readInput();
    let process1 = temp[0];
    let process2 = temp[1];
    const numberOfFrames = getNumberOfFrames();
    const framesForProcess1 = Math.floor(Math.random() * numberOfFrames);
    const framesForProcess2 = numberOfFrames - framesForProcess1;
    const LRU1 = LRU(process1, framesForProcess1);
    const LRU2 = LRU(process2, framesForProcess2);
    display("Random", LRU1[0], framesForProcess1, LRU1[1],  LRU2[0], framesForProcess2, LRU2[1]);
};

document.querySelector("input[name=WorkingSet]").onclick = function ()
{
    let temp = readInput();
    let process1 = temp[0];
    let process2 = temp[1];
    const framesForProcess1 = [... new Set(process1)].length;
    const framesForProcess2 = [... new Set(process2)].length;
    const LRU1 = LRU(process1, framesForProcess1);
    const LRU2 = LRU(process2, framesForProcess2);
    display("Working Set", LRU1[0], framesForProcess1, LRU1[1],  LRU2[0], framesForProcess2, LRU2[1]);
};