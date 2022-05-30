# multitrial-raster

Multi-trial spike raster plot.

[See this example](https://figurl.org/f?v=gs://figurl/multitrial-raster-2&d=ipfs://bafybeiadlfwqevw5rwctkrzkbexnhr3xtjla3j3ivc57tpdmtm6saemy54&label=Multi-trial%20raster)

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
import numpy as np
import kachery_cloud as kcl
from multitrial_raster import MultitrialRaster

spike_time_uri = 'ipfs://bafybeib4qcvuvhlbyiztnwxsd6jz4cg2esdhm5x4pwm62lncmqnu7ssmm4?label=spike_time.npy'
trial_idx_uri = 'ipfs://bafybeif5diuwh4esl7klhqidb2ydzk34uiap2k542xo7vaykuxd2mmbfmu?label=trial_idx.npy'
neuron_idx_uri = 'ipfs://bafybeie4lhu53hzoouyedzoqixm7ozptm63gz6ntpd5okifvwwjv346o34?label=neuron_idx.npy'
factor_idx_uri = 'ipfs://bafybeihddvlwws54fjib7fnxknetpkktj2mdgkqhafvn2c2ybm3tsxuo6q?label=factor_idx.npy'

print('Loading data...')
spike_time = kcl.load_npy(spike_time_uri)
trial_idx = kcl.load_npy(trial_idx_uri)
neuron_idx = kcl.load_npy(neuron_idx_uri)
factor_idx = kcl.load_npy(factor_idx_uri)

print(np.min(spike_time), np.max(spike_time))

X = MultitrialRaster(
    spike_time=spike_time,
    trial_idx=trial_idx,
    neuron_idx=neuron_idx,
    factor_idx=factor_idx
)
url = X.url(label='Multi-trial raster')
print(url)

# Output:
# https://figurl.org/f?v=gs://figurl/multitrial-raster-2&d=ipfs://bafybeiadlfwqevw5rwctkrzkbexnhr3xtjla3j3ivc57tpdmtm6saemy54&label=Multi-trial%20raster
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
