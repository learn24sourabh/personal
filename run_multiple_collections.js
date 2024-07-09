const fs = require('fs'); 
const newman = require('newman');
const NewmanHtmlReporter = require('newman-reporter-html');


const collections = [
    { collection: './postmancollection1.json', data: './Postman-Input-Data.csv' },
    { collection: './postmancollection2.json', data: './Postman-Input-Data.csv' },
    // Add more collections and data files as needed
];

let combinedExecutions = [];
let combinedFailures = [];
let totalRequests = 0;
let totalTestScripts = 0;
let totalAssertions = 0;
let totalTestFailures = 0;

const runCollection = (index, callback) => {
    if (index >= collections.length) {
        callback();
        return;
    }

    const { collection, data } = collections[index];
    newman.run({
        collection: require(collection),
        iterationData: data,
        reporters: ['cli', 'json'],
        reporter: {
            json: {
                export: `./report${index}.json` // JSON file to store the report
            }
        }
    }, function (err, summary) {
        if (err) { throw err; }
        console.log(`Collection ${index + 1} run complete!`);

        const report = JSON.parse(fs.readFileSync(`./report${index}.json`));
        combinedExecutions = combinedExecutions.concat(report.run.executions);
        combinedFailures = combinedFailures.concat(report.run.failures);
        totalRequests += report.run.stats.requests.total;
        totalTestScripts += report.run.stats.scripts.total;
        totalAssertions += report.run.stats.assertions.total;
        totalTestFailures += report.run.stats.assertions.failed;

        fs.unlinkSync(`./report${index}.json`);
        runCollection(index + 1, callback);
    });
};

const generateHtmlReport = () => {
    const combinedReport = {
        info: { name: "Combined Report" },
        item: combinedExecutions.map(exec => {
            return {
                name: exec.item.name,
                request: exec.request,
                response: exec.response,
                assertions: exec.assertions,
                scripts: exec.scripts
            };
        }),
        run: {
            executions: combinedExecutions,
            failures: combinedFailures,
            stats: {
                requests: { total: totalRequests, failed: totalTestFailures },
                scripts: { total: totalTestScripts },
                assertions: { total: totalAssertions, failed: totalTestFailures }
            }
        }
    };

    fs.writeFileSync('./combined_report.json', JSON.stringify(combinedReport, null, 2));

    // Create an HTML report using newman-reporter-html
    const htmlReporter = new NewmanHtmlReporter({
        export: './merged_report.html'  // Path to export the HTML report
    })

   
    htmlReporter.onStart({
        summary: combinedReport,
        executions: combinedExecutions
    });

    htmlReporter.onDone({
        summary: combinedReport,
        executions: combinedExecutions
    });

    console.log('Combined HTML report generated: merged_report.html');
    fs.unlinkSync('./combined_report.json');
};

// Start running collections
runCollection(0, generateHtmlReport);
