# multitrial-raster

Multi-trial spike raster plot.

This project uses [kachery-cloud](https://github.com/scratchrealm/kachery-cloud) and [figurl](https://github.com/scratchrealm/figurl2).

> **IMPORTANT**: This package is intended for collaborative sharing of data for scientific research. It should not be used for other purposes.

## Installation and setup

It is recommended that you use a conda environment with Python >= 3.8 and numpy.

```bash
# clone this repo
git clone <this-repo>

cd multitrial-raster
pip install -e .
```

Configure your [kachery-cloud](https://github.com/scratchrealm/kachery-cloud) client (only do this once on your computer)

```bash
kachery-cloud-init
# follow the instructions to associate your client with your Google user name on kachery-cloud
```

## Basic usage

```python
from multitrial_raster import MultitrialRaster

X = MultitrialRaster(
    text="some-sample-text-for-multitrial-raster"
)
url = X.url(label='Multi-trial raster')
print(url)

# Output:
# https://figurl.org/f?v=gs://figurl/multitrial-raster-1&d=ipfs://bafkreihz6vrpjjjyfssn3usx23igpu33r7qptxoefm4tse7muipgeljbju&label=Multi-trial%20raster
```

## For developers

The front-end code is found in the [gui/](gui/) directory. It uses typescript/react and is deployed as a [figurl](https://github.com/scratchrealm/figurl2) visualization plugin.

You can run a local development version of this via:

```bash
cd gui
# One-time install
yarn install 

# Start the web server
yarn start
```

Then replace `v=...` by `v=http://localhost:3000` in the URL you are viewing. Updates to the source code will live-update the view in the browser. If you improve the visualization, please contribute by creating a PR.
