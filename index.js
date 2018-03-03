const axios = require('axios');
const download = require('download');
const locations = require('./assets/locations');;
let config;

// Make sure config file exists
try {
    config = require('./config/config');
    // set axios defaults
    axios.defaults.baseURL = config.exportAPI.url;
    axios.defaults.headers.common['Authorization'] = `Bearer ${config.exportAPI.token}`;
} catch (e) {
    console.error(`=>=>=> ERROR: Missing configuration file in root (config.json). See config-example.json`);
    // kill script
    process.exit(1);
}

axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * Select random country from each region in locations.json file
 * @param locations
 */
const randomCountrySelector = (locations) => {

    let selections = [];
    let randomNumber;

    for (let region in locations) {
        // random number between 0-# of countries in region
        randomNumber = Math.floor(Math.random() * locations[region].length);
        // grab location @ random number index
        let location = locations[region][randomNumber];
        location['label'] = `${location.country} - ${location.cities[0].name}`
        selections.push(locations[region][randomNumber]);
    }

    console.log(`Test set:\n` + selections.map(s=>`${s.label}`).join(`\n`))

    return selections;

};

/**
 * Create download w/ Export API /jobs route
 * @param selections
 */
const downloadExportPbfs = (selections) => {

    let requests = [];

    selections.forEach(selection => {
        const location = selection.cities[0];
        const postData = {};

        postData['feature_selection'] = config.exportAPI.allTagsQuery;
        postData['export_formats'] = ['bundle'];
        // postData['description'] = '';
        postData['name'] = selection.label;
        postData['the_geom'] = getBoundsGeojson(location.bounds);

        requests.push(axios.post(`${config.exportAPI.url}/api/jobs`, postData))
    })

    // Promise.all
    axios.all(requests)
        .then(response => {
            // send array of responses
            pingExportAPIjobs(response.map(r => r.data));
        })
        .catch(error => {
            console.error(error.response);
        })

}

/**
 * Ping Export API /runs route until job is complete
 * @param jobs
 */
const pingExportAPIjobs = (jobs) => {
    jobs.forEach(job => {
        // post cool osm bounding box visualization link
        console.log(`View export - ` + job.osma_link);

        // ping jobs api every 10 seconds
        let ping = setInterval(()=> checkJobStatus(ping,job), 10000);

    })
}

/**
 * Fetch Export API /runs for job status
 * @param ping
 * @param job
 */
const checkJobStatus = (ping, job) => {
    // fetch job status
    axios.get(`${config.exportAPI.url}/api/runs?job_uid=${job.uid}`)
        .then(resp => {
            let response = resp.data[0];

            switch (response.status){
                case 'COMPLETED':
                    let downloadUrl = response.tasks[0].download_urls[0].download_url;
                    clearInterval(ping);
                    console.log(`Job ${job.uid} complete.`);

                    writeUrlToDisk(downloadUrl);

                    break;
                case 'RUNNING':
                    console.log(`Ping ${job.uid}`);
                    break;
                case 'FAILED':
                    clearInterval(ping);
                    break;
                default:
                    console.log(`Unhandled status: ${response.status}`);
                    break;
            }

        })
        .catch(error => {
            console.error(error);
        })
}

/**
 * Takes in bounds and returns a geojson feature
 * @param bounds
 * @returns {{}}
 */
const getBoundsGeojson = (bounds) => {
    const feature = {};
    const w = bounds[0];
    const s = bounds[1];
    const e = bounds[2];
    const n = bounds[3];

    feature['type'] = 'Polygon';
    feature['coordinates'] = [[[w, n], [w, s], [e, s], [e, n], [w, n]]];

    return feature;
}

/**
 * Write file to disk
 * @param downloadUrl
 */
const writeUrlToDisk = (downloadUrl) => {

    download(`${config.exportAPI.url}/${downloadUrl}`, `downloads`, {filename: `${new Date().toISOString()}.tar.gz`})
        .then(() => {
            console.log(`Download ${downloadUrl} complete.`);
        })
        .catch(error => {
            console.error(`Error downloading ${downloadUrl}. ${error}c`);
        })
}


downloadExportPbfs(randomCountrySelector(locations));

