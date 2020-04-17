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
    return document.querySelector("#input-data").value.split(',').reduce(
        function (arrayOfBlocks, page)
        {
            if (parseInt(page) < numberOfPages)
                arrayOfBlocks.push(parseInt(page));
            return arrayOfBlocks;
        }, []
    )
}

function formatFramesState (framesState)
{
    let result = "";
    result += framesState.join(" ");
    const freeSlots = getNumberOfFrames() - framesState.length;
    for (let i = 0; i < freeSlots; i++)
        result += " _";
    return result;
}

function display(algorithm, numberOfPages, errorCount, output)
{
    document.querySelector("#output-info").innerHTML = "";
    document.querySelector("#output h2").innerHTML = algorithm;
    let result = "<table><thead><tr><th>Page</th><th>Frames state</th></tr></thead>";
    output.forEach(line =>
    {
        if (line.error)
            result += "<tr class='error'>";
        else
            result += "<tr class='ok'>";
        result += "<td>" + line.page + "</td><td>" + formatFramesState(line.framesState) + "</td>";
        result += "</tr>";
    });
    result += "</table>";
    document.querySelector("#error-info").innerHTML = "<p>Errors: " + errorCount + " (" + Math.round(errorCount/numberOfPages*100) + "%)</p>";
    document.querySelector("#output-info").innerHTML = result;
}

document.querySelector("input[name=randomize]").onclick = function ()
{
    const numberOfPages = getNumberOfPages();
    const pagesToGenerate = document.querySelector("#generate-data-size").value;
    let result = "";
    for (let i = 0; i < pagesToGenerate; i++)
        result += Math.floor(Math.random() * numberOfPages) + ",";
    document.querySelector("#input-data").value = result;
};

document.querySelector("input[name=FIFO]").onclick = function ()
{
    const numberOfFrames = getNumberOfFrames();
    const arrayOfPages = readInput();
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
        return { framesState: arrayOfFrames.slice(), page, error: false};
    });
    display("FIFO", arrayOfPages.length, errorCount, output);
};

document.querySelector("input[name=OPT]").onclick = function ()
{
    const numberOfFrames = getNumberOfFrames();
    const arrayOfPages = readInput();
    let arrayOfFrames = [];
    let errorCount = 0;
    let output = arrayOfPages.map((page, currentIndex, listOfPages) =>
    {
        if (arrayOfFrames.includes(page))
        {
            return { framesState: arrayOfFrames.slice(), page, error: false};
        }
        else
        {
            if (arrayOfFrames.length < numberOfFrames)
                arrayOfFrames.push(page);
            else
            {
                const pagesRemaining = listOfPages.slice(currentIndex);
                let distances = arrayOfFrames.map((page, frameIndex) =>
                {
                    const i = pagesRemaining.indexOf(page);
                    return {frameIndex, page, occurence: i !== -1 ? i : Infinity};
                });

                const indexToRemove = distances.reduce((prev, current) =>
                {
                    return (prev.occurence > current.occurence) ? prev : current;
                });
                arrayOfFrames.splice(indexToRemove.frameIndex, 1);
                arrayOfFrames.push(page);
            }
            errorCount++;
            return { framesState: arrayOfFrames.slice(), page, error: true};
        }
    });
    display("OPT", arrayOfPages.length, errorCount, output);
};

document.querySelector("input[name=LRU]").onclick = function ()
{
    const numberOfFrames = getNumberOfFrames();
    const arrayOfPages = readInput();
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
    display("LRU", arrayOfPages.length, errorCount, output);
};

document.querySelector("input[name=ALRU]").onclick = function ()
{
    const numberOfFrames = getNumberOfFrames();
    const arrayOfPages = readInput();
    let arrayOfFrames = [];
    let errorCount = 0;
    let memoryPagesSet = new Map();
    let memoryUsedPagesSet = new Set();
    let output = arrayOfPages.map(page => {
        if (memoryPagesSet.has(page))
        {
            memoryUsedPagesSet.add(page);
            return { framesState: arrayOfFrames.slice(), page, error: false};
        }

        if (arrayOfFrames.length < numberOfFrames)
        {
            const idx = memoryPagesSet.size;
            arrayOfFrames[idx] = page;
            memoryPagesSet.set(page, idx);
            errorCount++;
            return { framesState: arrayOfFrames.slice(), page, error: true};
        }

        const [pageToOverride, indexToOverride] = (() => {
            const pageToOverride = [...memoryPagesSet.keys()].find(
                p => !memoryUsedPagesSet.has(p)
            );
            if (pageToOverride !== undefined) {
                return [pageToOverride, memoryPagesSet.get(pageToOverride)];
            } else {
                const res = memoryPagesSet.entries().next().value;
                memoryUsedPagesSet.delete(res[0]);
                return res;
            }
        })();

        memoryPagesSet.delete(pageToOverride);
        arrayOfFrames[indexToOverride] = page;
        memoryPagesSet.set(page, indexToOverride);
        errorCount++;
        return { framesState: arrayOfFrames.slice(), page, error: true};
    });
    display("ALRU", arrayOfPages.length, errorCount, output);
};

document.querySelector("input[name=RAND]").onclick = function ()
{
    const numberOfFrames = getNumberOfFrames();
    const arrayOfPages = readInput();
    let arrayOfFrames = [];
    let errorCount = 0;
    let output = arrayOfPages.map(page => {
        if (!arrayOfFrames.includes(page))
        {
            if (arrayOfFrames.length < numberOfFrames)
                arrayOfFrames.push(page);
            else
            {
                const indexToRemove = Math.floor(Math.random() * numberOfFrames);
                arrayOfFrames.splice(indexToRemove, 1);
                arrayOfFrames.push(page);
            }
            errorCount++;
            return { framesState: arrayOfFrames.slice(), page, error: true};
        }
        else
        {
            return { framesState: arrayOfFrames.slice(), page, error: false};
        }

    });
    display("RAND", arrayOfPages.length, errorCount, output);
};