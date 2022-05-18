import numpy as np
import figurl as fig


class MultitrialRaster:
    def __init__(self, *,
        spike_time: np.array,
        trial_idx: np.array,
        neuron_idx: np.array
    ) -> None:
        self._spike_time = spike_time
        self._trial_idx = trial_idx
        self._neuron_idx = neuron_idx
    def url(self, *, label: str):
            # Prepare the data for the figURL
            data = {
                'spike_time': self._spike_time,
                'trial_idx': self._trial_idx,
                'neuron_idx': self._neuron_idx
            }

            # Prepare the figurl Figure
            F = fig.Figure(
                view_url='gs://figurl/multitrial-raster-1',
                data=data
            )
            url = F.url(label=label)
            return url