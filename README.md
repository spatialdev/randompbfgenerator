# Random osm.pbf Generator

The purpose of the script is to generate 5-7 `osm.pbf` files (~<25mb) that are (somewhat) representative of the entire world. These locations are randomly selected from the locations.json file

1. Randomly select a country from each region in [locations.json](assets/locations.json)
2. Using the the extent of each location, send a POST to the HOT Export Tool API `/api/jobs` route
3. Ping the HOT Export Tools `/api/runs` route until status is reported as complete
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
