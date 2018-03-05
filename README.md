# Random osm.pbf Generator

This is the Node.js version of `randomPbfGenerator.py`.

The goal of the script is to generate 5-7 `osm.pbf` files (~<25mb) that are representative of the entire world. Once generated, a user can ingest them in atlas-checks & use as a test set.

1. Randomly select a country from each region in locations.json
2. Send a POST to the /jobs route in the EXPORT API w/ the locations bounds
3. Ping the /runs route until status is reported as complete
4. Write file to disk

### How to run
Using the [config-exmaple.json](config/config-example.json) example, create a config/config.json file and add your Export API Token
Once complete, simply execute

```bash
npm install
```

and...

```bash
npm start
```

_¡voila!_