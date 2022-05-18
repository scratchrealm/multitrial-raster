import numpy as np
import kachery_cloud as kcl
from multitrial_raster import MultitrialRaster

spike_time_uri = 'ipfs://bafybeib4qcvuvhlbyiztnwxsd6jz4cg2esdhm5x4pwm62lncmqnu7ssmm4?label=spike_time.npy'
trial_idx_uri = 'ipfs://bafybeif5diuwh4esl7klhqidb2ydzk34uiap2k542xo7vaykuxd2mmbfmu?label=trial_idx.npy'
neuron_idx_uri = 'ipfs://bafybeie4lhu53hzoouyedzoqixm7ozptm63gz6ntpd5okifvwwjv346o34?label=neuron_idx.npy'

print('Loading data...')
spike_time = kcl.load_npy(spike_time_uri)
trial_idx = kcl.load_npy(trial_idx_uri)
neuron_idx = kcl.load_npy(neuron_idx_uri)

print(np.min(spike_time), np.max(spike_time))

X = MultitrialRaster(
    spike_time=spike_time,
    trial_idx=trial_idx,
    neuron_idx=neuron_idx
)
url = X.url(label='Multi-trial raster')
print(url)

# Output:
# https://figurl.org/f?v=gs://figurl/multitrial-raster-1&d=ipfs://bafybeiffbldbrpz55rlfnvu2t5m4eqyerzxbrjg4s443fc2yef4ew7y6qm&label=Multi-trial%20raster